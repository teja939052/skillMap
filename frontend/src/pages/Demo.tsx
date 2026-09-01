import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { GraduationCap, Building2, Users, Briefcase, Play, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useNavigate } from 'react-router-dom';

export default function Demo() {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState<any>(null);
  const nav = useNavigate();

  const seed = async () => {
    setSeeding(true);
    try {
      const res = await apiClient.post('/demo/seed');
      setSeeded(res.data.data);
    } finally { setSeeding(false); }
  };
  const reset = async () => {
    setSeeding(true);
    try {
      const res = await apiClient.post('/demo/reset');
      setSeeded(res.data.data);
    } finally { setSeeding(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy-900">Demo Environment — GPCET</h1>
        <p className="text-gray-500 mt-2">Real seeded accounts, real APIs, no fake dashboard. Rahul 22A81A0501: AWS 32 → 71 → Match 64%→89%</p>
        <Badge className="mt-3 bg-blue-50 text-blue-700">Deterministic • No hardcoded production values</Badge>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Seed GPCET Demo Universe</h3>
            <p className="text-sm text-gray-500">300 heterogeneous (AWS ~42 Docker ~51 Python ~76) • Rahul 22A81A0501 canonical • isolated org-demo</p>
            <p className="text-xs text-gray-400 mt-1">Seed creates starting world only — 32 → demo drives 71 → 89% via real post-assessment</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={seed} disabled={seeding}>{seeding ? 'Seeding…' : seeded ? 'Reseed' : 'Seed Demo'}</Button>
            <Button variant="outline" onClick={reset} disabled={seeding}>Reset Demo</Button>
          </div>
        </div>
        {seeded && <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800 flex gap-2"><CheckCircle2 className="w-4 h-4" />{seeded.reset ? 'Reset & ' : ''}Seeded: {seeded.institutionId} • Rahul {seeded.rahul.rollNumber} AWS {seeded.rahul.aws} • {seeded.alreadySeeded ? 'already existed' : 'fresh'} • 300 students • averages from StudentCompetency, not hardcoded analytics</div>}
      </Card>
      <Card className="p-4 bg-blue-50 border-blue-200 text-sm text-blue-800">
        Industry needs skills → Colleges don't know gaps → Students don't know what to improve → Skill Map connects all three<br />
        <span className="font-mono text-xs">Live Demo: Rahul AWS 32 Match 64% → Training → AWS 71 Match 89% (role-play via Demo buttons)</span>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-md" onClick={() => nav('/login?demo=student&roll=22A81A0501')}>
          <GraduationCap className="w-10 h-10 text-blue-600 mb-3" /><h3 className="font-semibold">Enter as Student</h3><p className="text-xs text-gray-500">Rahul 22A81A0501 CSE 2026</p><p className="text-xs text-blue-600 mt-2">Target: Backend • Passport 32→71</p><Button size="sm" className="mt-3"><Play className="w-3 h-3 mr-1" />Enter</Button>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-md" onClick={() => nav('/institution/gaps')}>
          <Building2 className="w-10 h-10 text-amber-600 mb-3" /><h3 className="font-semibold">Enter as Institution</h3><p className="text-xs text-gray-500">GPCET Admin • Gap Observatory</p><p className="text-xs text-amber-600 mt-2">AWS gap 46 • Deploy bootcamp</p><Button size="sm" className="mt-3"><Play className="w-3 h-3 mr-1" />Enter</Button>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-md" onClick={() => nav('/industry/candidates')}>
          <Briefcase className="w-10 h-10 text-emerald-600 mb-3" /><h3 className="font-semibold">Enter as Industry</h3><p className="text-xs text-gray-500">TCS Recruiter • Backend role</p><p className="text-xs text-emerald-600 mt-2">Match 64%→89% • Explainable</p><Button size="sm" className="mt-3"><Play className="w-3 h-3 mr-1" />Enter</Button>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-md" onClick={() => nav('/faculty')}>
          <Users className="w-10 h-10 text-purple-600 mb-3" /><h3 className="font-semibold">Enter as Faculty</h3><p className="text-xs text-gray-500">Prof. Sharma • Mentor</p><p className="text-xs text-purple-600 mt-2">Expertise • Collaboration</p><Button size="sm" className="mt-3"><Play className="w-3 h-3 mr-1" />Enter</Button>
        </Card>
      </div>

      <Card className="p-6 bg-navy-900 text-white">
        <h3 className="font-semibold">Golden Journey — click through, no Postman</h3>
        <p className="text-sm text-gray-300 mt-2 font-mono text-xs">
          College imports Rahul → Assessment 32 → Evidence → Passport 32 → Company Backend role → Match 64% → Institution sees AWS gap → Deploy bootcamp → Rahul enroll baseline 32 → Post-assessment 71 → Evidence verified → Passport 71 → Gap 13 → Match 89% → Apply
        </p>
      </Card>
    </div>
  );
}
