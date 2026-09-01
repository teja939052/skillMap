import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';
import { StudentImportService } from '../application/student-import.service.js';
import { StudentRecordRepository } from '../infrastructure/student-record.repository.js';

export function createStudentImportRouter(
  importService: StudentImportService,
  recordRepo: StudentRecordRepository,
): Router {
  const router = Router({ mergeParams: true });

  // List — tenant isolated by institutionId + orgId
  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.params.id;
    const records = await recordRepo.findByInstitution(institutionId);
    // Org isolation: filter by orgId if present
    const filtered = req.headers['x-org-id'] ? records.filter((r) => r.orgId === (req.headers['x-org-id'] as string)) : records;
    sendSuccess(res, { items: filtered, total: filtered.length });
  }));

  // Manual single
  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.params.id;
    const orgId = (req.headers['x-org-id'] as string) || req.body.orgId || 'org-demo';
    const result = await importService.createOne(institutionId, { ...req.body, source: 'manual', confidence: 1 }, orgId, req.user!.userId);
    if (!result.success) throw result.error;
    sendCreated(res, result.value);
  }));

  // Table bulk
  router.post('/bulk', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.params.id;
    const orgId = (req.headers['x-org-id'] as string) || req.body.orgId || 'org-demo';
    const rows: Record<string, string>[] = req.body.rows || [];
    const preview = await importService.preview(institutionId, rows, 'table', orgId);
    if (req.body.confirm) {
      const records = preview.valid.map((r) => ({ ...r, raw: r.raw }));
      const result = await importService.importValidated(institutionId, records as any, orgId, req.user!.userId, req.body.onConflict || 'skip');
      sendCreated(res, result);
      return;
    }
    sendSuccess(res, preview);
  }));

  // Preview for CSV/XLSX/PDF (client sends already-parsed rows)
  router.post('/import/preview', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.params.id;
    const orgId = (req.headers['x-org-id'] as string) || req.body.orgId || 'org-demo';
    const rows: Record<string, string>[] = req.body.rows || [];
    const source = req.body.source || 'csv';
    const preview = await importService.preview(institutionId, rows, source, orgId);
    sendSuccess(res, preview);
  }));

  // Confirm import
  router.post('/import', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.params.id;
    const orgId = (req.headers['x-org-id'] as string) || req.body.orgId || 'org-demo';
    const records = req.body.records || [];
    const onConflict = req.body.onConflict || 'skip';
    const result = await importService.importValidated(institutionId, records, orgId, req.user!.userId, onConflict);
    sendCreated(res, result);
  }));

  // Invite all imported → invited
  router.post('/invite', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.params.id;
    const records = await recordRepo.findByInstitution(institutionId, { status: 'imported' });
    let invited = 0;
    for (const r of records) {
      const resInvite = r.invite();
      if (resInvite.success) { await recordRepo.save(r); invited++; }
    }
    sendSuccess(res, { invited, total: records.length });
  }));

  // Activate via rollNumber + institution (Google OAuth flow: userId + roll)
  router.post('/activate', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.params.id;
    const { rollNumber, userId } = req.body;
    const record = await recordRepo.findByRoll(institutionId, rollNumber);
    if (!record) { res.status(404).json({ success: false, error: 'StudentRecord not found for rollNumber' }); return; }
    const result = record.activate(userId || req.user!.userId);
    if (!result.success) throw result.error;
    await recordRepo.save(record);
    sendSuccess(res, record);
  }));

  return router;
}
