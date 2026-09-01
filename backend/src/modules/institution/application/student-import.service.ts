import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, ValidationError, ConflictError } from '../../../shared/domain/result.js';
import { StudentRecord, StudentImportRecord } from '../domain/student-record.js';
import { StudentRecordRepository } from '../infrastructure/student-record.repository.js';

export interface ImportPreview {
  valid: StudentImportRecord[];
  duplicates: Array<{ record: StudentImportRecord; existing: { name: string; email?: string } }>;
  invalid: Array<{ record: StudentImportRecord; reason: string }>;
  conflicts: Array<{ record: StudentImportRecord; existing: any; field: string }>;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  updated: number;
  preview: ImportPreview;
  records: StudentRecord[];
}

function normalizeRow(row: Record<string, string>, source: StudentImportRecord['source']): StudentImportRecord {
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    map[key] = (v || '').toString().trim();
  }
  const roll = map['rollno'] || map['rollnumber'] || map['roll'] || map['id'] || '';
  const name = map['name'] || map['studentname'] || map['fullname'] || '';
  const email = map['email'] || map['mail'] || '';
  const program = map['program'] || map['branch'] || map['dept'] || map['department'] || '';
  const cohort = map['cohort'] || map['year'] || map['batch'] || '';
  const section = map['section'] || map['sec'] || '';
  const phone = map['phone'] || map['mobile'] || '';
  const department = map['department'] || map['dept'] || program;
  return {
    rollNumber: roll.toUpperCase(), name, email: email.toLowerCase(), program, department, cohort, section, phone,
    source, confidence: source === 'pdf' || source === 'image' ? 0.85 : 1, raw: row,
  };
}

export class StudentImportService {
  constructor(private readonly repo: StudentRecordRepository) {}

  async preview(institutionId: string, rows: Record<string, string>[], source: StudentImportRecord['source'], orgId: string): Promise<ImportPreview> {
    const valid: StudentImportRecord[] = [];
    const invalid: ImportPreview['invalid'] = [];
    const duplicates: ImportPreview['duplicates'] = [];
    const conflicts: ImportPreview['conflicts'] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const rec = normalizeRow(row, source);
      const v = StudentRecord.validateImport(rec);
      if (!v.success) { invalid.push({ record: rec, reason: v.error.message }); continue; }
      const key = rec.rollNumber;
      if (seen.has(key)) { duplicates.push({ record: rec, existing: { name: 'in-batch duplicate' } }); continue; }
      seen.add(key);
      const existing = await this.repo.findByRoll(institutionId, rec.rollNumber);
      if (existing) {
        if (existing.email && rec.email && existing.email.toLowerCase() !== rec.email.toLowerCase()) {
          conflicts.push({ record: rec, existing: { name: existing.name, email: existing.email }, field: 'email' });
        } else {
          duplicates.push({ record: rec, existing: { name: existing.name, email: existing.email } });
        }
        continue;
      }
      valid.push(rec);
    }
    return { valid, duplicates, invalid, conflicts };
  }

  async importValidated(institutionId: string, records: StudentImportRecord[], orgId: string, importedBy: string, onConflict: 'skip' | 'update' = 'skip'): Promise<ImportResult> {
    const preview = await this.preview(institutionId, records.map((r) => r.raw as any), records[0]?.source || 'manual', orgId);
    // Re-normalize to ensure confidence preserved
    const toImport = preview.valid;
    const entities: StudentRecord[] = [];
    for (const rec of toImport) {
      const e = new StudentRecord({
        id: EntityId.create(), institutionId, rollNumber: rec.rollNumber, name: rec.name, email: rec.email,
        program: rec.program, department: rec.department, cohort: rec.cohort, section: rec.section, phone: rec.phone,
        status: 'imported', source: rec.source, orgId, importedBy, createdAt: new Date(), updatedAt: new Date(),
      });
      entities.push(e);
    }
    await this.repo.bulkSave(entities);

    let updated = 0;
    if (onConflict === 'update' && preview.conflicts.length) {
      for (const c of preview.conflicts) {
        const ex = await this.repo.findByRoll(institutionId, c.record.rollNumber);
        if (ex) { ex.update({ email: c.record.email, name: c.record.name } as any); await this.repo.save(ex); updated++; }
      }
    }

    return {
      imported: entities.length, skipped: preview.duplicates.length + preview.invalid.length, updated,
      preview, records: entities,
    };
  }

  async createOne(institutionId: string, data: StudentImportRecord, orgId: string, importedBy: string): Promise<Result<StudentRecord>> {
    const v = StudentRecord.validateImport(data);
    if (!v.success) return v as any;
    const exists = await this.repo.findByRoll(institutionId, data.rollNumber);
    if (exists) return err(new ConflictError(`Student ${data.rollNumber} already exists`));
    const rec = new StudentRecord({
      id: EntityId.create(), institutionId, rollNumber: data.rollNumber, name: data.name, email: data.email,
      program: data.program, department: data.department, cohort: data.cohort, section: data.section, phone: data.phone,
      status: 'imported', source: data.source, orgId, importedBy, createdAt: new Date(), updatedAt: new Date(),
    });
    await this.repo.save(rec);
    return ok(rec);
  }

  // PDF extraction stub — structured table parse, falls back to AI for messy docs
  async extractFromPdf(buffer: Buffer): Promise<StudentImportRecord[]> {
    // Lightweight: try text extraction via regex table detection; if no table, mark low confidence for AI
    const text = buffer.toString('utf8'); // placeholder — real: pdf-parse
    const lines = text.split('\n').filter((l) => l.includes(',') || /\b22[A-Z0-9]{8}\b/.test(l));
    const rows = lines.slice(0, 200).map((line) => {
      const parts = line.split(/[,|\t]/).map((s) => s.trim());
      if (parts.length >= 2) return { rollNumber: parts[0], name: parts[1], email: parts[2] || '', program: parts[3] || '', cohort: parts[4] || '' };
      return null;
    }).filter(Boolean) as any[];
    return rows.map((r: any) => ({ ...r, source: 'pdf' as const, confidence: 0.85, raw: r }));
  }
}
