import { useState } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { apiClient, getErrorMessage } from '@/api/client';
import { UserPlus, Table2, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

type Mode = 'choose' | 'manual' | 'table' | 'sheet' | 'pdf';

export default function StudentImportCenter() {
  const [mode, setMode] = useState<Mode>('choose');
  const qc = useQueryClient();
  const institutionId = 'demo-institution'; // replace with useParams in real routing
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Manual
  const [manual, setManual] = useState({ rollNumber: '', name: '', email: '', program: 'CSE', cohort: '2026', section: 'A' });
  const submitManual = async () => {
    setErr(null); setMsg(null);
    try {
      await apiClient.post(`/institutions/${institutionId}/students`, manual);
      setMsg(`✓ ${manual.rollNumber} imported — invite ready`);
      qc.invalidateQueries({ queryKey: ['students'] });
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  // Table
  const [rows, setRows] = useState([{ rollNumber: '22A81A0501', name: 'Rahul Sharma', email: 'rahul@example.com', program: 'CSE', cohort: '2026', section: 'A' }]);
  const updateRow = (i: number, k: string, v: string) => setRows((r) => r.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const submitTable = async (confirm = false) => {
    setErr(null); setMsg(null);
    try {
      const payload = { rows: rows.map((r) => ({ 'Roll Number': r.rollNumber, Name: r.name, Email: r.email, Branch: r.program, Year: r.cohort, Section: r.section })), confirm, onConflict: 'skip' };
      const res = await apiClient.post(`/institutions/${institutionId}/students/bulk`, payload);
      const d = res.data.data || res.data;
      if (!confirm) setMsg(`Preview: ${d.valid?.length ?? rows.length} valid, ${d.duplicates?.length ?? 0} duplicate, ${d.invalid?.length ?? 0} invalid — click Confirm`);
      else setMsg(`✓ ${d.imported} imported, ${d.skipped} skipped`);
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  // Sheet (CSV/XLSX) — client parse then preview/import via canonical pipeline
  const [sheetPreview, setSheetPreview] = useState<any>(null);
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const handleSheet = async (file: File) => {
    setErr(null); setMsg(null);
    const text = await file.text();
    // lightweight CSV parse (no deps) — handles header row
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) { setErr('Empty file'); return; }
    const headers = (lines[0] ?? '').split(',').map((h) => h.trim());
    const parsed = lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim());
      const obj: any = {}; headers.forEach((h, i) => obj[h] = vals[i] || '');
      return obj;
    });
    try {
      const res = await apiClient.post(`/institutions/${institutionId}/students/import/preview`, { rows: parsed, source: file.name.endsWith('.xlsx') ? 'xlsx' : 'csv' });
      setSheetPreview(res.data.data || res.data);
      setPendingRecords(parsed);
    } catch (e) { setErr(getErrorMessage(e)); }
  };
  const confirmSheet = async () => {
    try {
      const res = await apiClient.post(`/institutions/${institutionId}/students/import`, { records: pendingRecords.map((r) => ({ ...r, source: 'csv', confidence: 1 })), onConflict: 'skip' });
      const d = res.data.data || res.data; setMsg(`✓ ${d.imported} imported, ${d.skipped} skipped, ${d.updated} updated`);
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  // PDF — text extract → table detection
  const [pdfPreview, setPdfPreview] = useState<any>(null);
  const [pdfRows, setPdfRows] = useState<any[]>([]);
  const handlePdf = async (file: File) => {
    setErr(null);
    const buf = await file.arrayBuffer();
    const text = new TextDecoder().decode(buf).slice(0, 8000);
    // Detect roll-like lines
    const lines = text.split('\n').filter((l) => /\b22[A-Z0-9]{8}\b/.test(l) || l.split(',').length >= 2);
    const rows = lines.slice(0, 50).map((l) => {
      const p = l.split(/[,|\t]/).map((s) => s.trim());
      return { 'Roll Number': p[0] || '', Name: p[1] || '', Branch: p[2] || '', Year: p[3] || '', Section: p[4] || '' };
    }).filter((r) => r['Roll Number']);
    setPdfRows(rows);
    try {
      const res = await apiClient.post(`/institutions/${institutionId}/students/import/preview`, { rows, source: 'pdf' });
      setPdfPreview(res.data.data || res.data);
    } catch (e) { setErr(getErrorMessage(e)); }
  };
  const confirmPdf = async () => {
    try {
      const res = await apiClient.post(`/institutions/${institutionId}/students/import`, { records: pdfRows.map((r) => ({ ...r, source: 'pdf', confidence: 0.85 })), onConflict: 'skip' });
      const d = res.data.data || res.data; setMsg(`✓ ${d.imported} imported from PDF`);
    } catch (e) { setErr(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Student Import Center</h1>
        <p className="text-gray-500 mt-1">How would you like to add students? Every path feeds one canonical pipeline → Review → Import → Invite</p>
      </div>

      {mode === 'choose' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 cursor-pointer hover:border-accent hover:shadow-md" onClick={() => setMode('manual')}>
            <UserPlus className="w-8 h-8 text-accent mb-3" /><h3 className="font-semibold">Add Manually</h3><p className="text-xs text-gray-500 mt-1">Add one student</p>
          </Card>
          <Card className="p-6 cursor-pointer hover:border-accent hover:shadow-md" onClick={() => setMode('table')}>
            <Table2 className="w-8 h-8 text-blue-500 mb-3" /><h3 className="font-semibold">Enter Table</h3><p className="text-xs text-gray-500 mt-1">Paste/type 5-50 rows</p>
          </Card>
          <Card className="p-6 cursor-pointer hover:border-accent hover:shadow-md" onClick={() => setMode('sheet')}>
            <FileSpreadsheet className="w-8 h-8 text-green-600 mb-3" /><h3 className="font-semibold">Spreadsheet</h3><p className="text-xs text-gray-500 mt-1">CSV / Excel 100-10k</p>
          </Card>
          <Card className="p-6 cursor-pointer hover:border-accent hover:shadow-md" onClick={() => setMode('pdf')}>
            <FileText className="w-8 h-8 text-amber-600 mb-3" /><h3 className="font-semibold">Import PDF</h3><p className="text-xs text-gray-500 mt-1">Extract tables + AI</p>
          </Card>
        </div>
      )}

      {mode !== 'choose' && <Button variant="outline" onClick={() => setMode('choose')}>← Back to options</Button>}

      {mode === 'manual' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Add Student Manually</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Roll Number *" value={manual.rollNumber} onChange={(e: any) => setManual({ ...manual, rollNumber: e.target.value })} />
            <Input placeholder="Name *" value={manual.name} onChange={(e: any) => setManual({ ...manual, name: e.target.value })} />
            <Input placeholder="Email" value={manual.email} onChange={(e: any) => setManual({ ...manual, email: e.target.value })} />
            <Input placeholder="Program CSE" value={manual.program} onChange={(e: any) => setManual({ ...manual, program: e.target.value })} />
            <Input placeholder="Year 2026" value={manual.cohort} onChange={(e: any) => setManual({ ...manual, cohort: e.target.value })} />
            <Input placeholder="Section A" value={manual.section} onChange={(e: any) => setManual({ ...manual, section: e.target.value })} />
          </div>
          <Button onClick={submitManual}><UserPlus className="w-4 h-4 mr-2" />Create Student</Button>
        </Card>
      )}

      {mode === 'table' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Enter Table — editable spreadsheet</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500"><th className="p-2">Roll No</th><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Dept</th><th className="p-2">Year</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="p-1"><Input value={r.rollNumber} onChange={(e: any) => updateRow(i, 'rollNumber', e.target.value)} /></td>
                    <td className="p-1"><Input value={r.name} onChange={(e: any) => updateRow(i, 'name', e.target.value)} /></td>
                    <td className="p-1"><Input value={r.email} onChange={(e: any) => updateRow(i, 'email', e.target.value)} /></td>
                    <td className="p-1"><Input value={r.program} onChange={(e: any) => updateRow(i, 'program', e.target.value)} /></td>
                    <td className="p-1"><Input value={r.cohort} onChange={(e: any) => updateRow(i, 'cohort', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setRows([...rows, { rollNumber: '', name: '', email: '', program: 'CSE', cohort: '2026', section: 'A' }])}>+ Add Row</Button>
            <Button variant="outline" onClick={() => submitTable(false)}>Preview</Button>
            <Button onClick={() => submitTable(true)}>Save {rows.length} Students</Button>
          </div>
        </Card>
      )}

      {mode === 'sheet' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Upload Spreadsheet — CSV / XLSX</h3>
          <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm">Drag CSV here or Choose File</span>
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => e.target.files?.[0] && handleSheet(e.target.files[0])} />
          </label>
          <a className="text-xs text-accent" href="#" onClick={(e) => e.preventDefault()}>Download sample template</a>
          {sheetPreview && (
            <div className="text-sm">
              <div className="flex gap-2"><Badge>{sheetPreview.valid?.length} valid</Badge><Badge className="bg-amber-100 text-amber-700">{sheetPreview.duplicates?.length} duplicate</Badge><Badge className="bg-red-100 text-red-700">{sheetPreview.invalid?.length} invalid</Badge></div>
              <Button className="mt-3" onClick={confirmSheet}>Import {sheetPreview.valid?.length} Students</Button>
            </div>
          )}
        </Card>
      )}

      {mode === 'pdf' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Import from PDF — table extraction</h3>
          <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center cursor-pointer">
            <FileText className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm">Upload CSE_3rdYear_Students.pdf</span>
            <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdf(e.target.files[0])} />
          </label>
          {pdfPreview && (
            <div className="text-sm">
              <p>Detected {pdfPreview.valid?.length} rows — confidence 0.85 — review before import</p>
              <div className="flex gap-2 mt-2"><Badge>{pdfPreview.valid?.length} valid</Badge><Badge className="bg-red-100 text-red-700">{pdfPreview.invalid?.length} invalid</Badge></div>
              <Button className="mt-3" onClick={confirmPdf}>Import from PDF</Button>
            </div>
          )}
          <p className="text-xs text-gray-400">Pipeline: PDF → text/table extract → if structured parse directly else AI → normalized StudentRecord[] → validation → human review → MongoDB</p>
        </Card>
      )}

      {(msg || err) && (
        <Card className={`p-4 text-sm ${err ? 'bg-red-50 border-red-200 text-red-700 flex items-center gap-2' : 'bg-emerald-50 border-emerald-200 text-emerald-700 flex items-center gap-2'}`}>
          {err ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}{err || msg}
        </Card>
      )}

      <div className="text-xs text-gray-400">Converges to one service: Manual|Table|CSV|XLSX|PDF → Normalization → StudentImportRecord → Validation → Duplicate (institutionId+rollNumber unique) → Review → Import → Invite</div>
    </div>
  );
}
