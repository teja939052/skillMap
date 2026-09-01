import { Card } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Search, Percent } from 'lucide-react';
import { Input } from '@/components/ui';

export default function Candidates() {
  // P13: 142 eligible, explainable 89% with evidence — Rahul canonical
  const candidates = [
    { name: 'Rahul Sharma', role: 'Backend Engineer', match: 89, prev: 64, skills: 'Python ✓ SQL ✓ REST ✓ Docker ✓ AWS ✓', institution: 'GPCET CSE 2026 • 22A81A0501', evidence: 'HIGH', improvement: 'AWS Bootcamp #18' },
    { name: 'Priya Reddy', role: 'Backend Engineer', match: 84, prev: 71, skills: 'Python ✓ SQL ✓ REST ✓ Docker ⚠ AWS ✓', institution: 'GPCET CSE 2026', evidence: 'HIGH', improvement: 'Docker Lab' },
    { name: 'Arjun Kumar', role: 'Backend Engineer', match: 76, prev: 68, skills: 'Python ✓ SQL ✓ REST ⚠ Docker ⚠ AWS ⚠', institution: 'GPCET ECE 2026', evidence: 'MEDIUM', improvement: 'REST Assessment' },
    { name: 'Alex Johnson', role: 'Backend Engineer', match: 92, prev: 88, skills: 'Python ✓ SQL ✓ REST ✓ Docker ✓ AWS ✓', institution: 'GPCET CSE 2025', evidence: 'HIGH', improvement: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Candidate Discovery — Find the right talent</h1>
          <p className="text-gray-500 mt-1">Define role → 142 eligible → See WHY → Shortlist • Evidence HIGH, no mystery percentage</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700">142 eligible • Backend Engineer</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search candidates..." className="pl-10" />
      </div>

      <div className="space-y-3">
        {candidates.map((c, i) => (
          <Card key={i} className="p-5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={c.name} />
                <div>
                  <h3 className="font-semibold text-navy-900">{c.name} {i === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Rahul • canonical</span>}</h3>
                  <p className="text-sm text-gray-600">{c.institution}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.skills}</p>
                  <div className="flex gap-2 mt-1"><Badge variant="outline" size="sm">{c.role}</Badge><Badge className={c.evidence === 'HIGH' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>Evidence {c.evidence}</Badge>{c.improvement && <Badge className="bg-blue-50 text-blue-700">+{c.match - c.prev} via {c.improvement}</Badge>}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600 font-bold">
                    <Percent className="w-4 h-4" />{c.match}% {c.prev && <span className="text-xs text-gray-400 font-normal">+{c.match - c.prev} from {c.prev}%</span>}
                  </div>
                  <span className="text-xs text-gray-500">match • click to see WHY</span>
                </div>
                <div className="flex flex-col gap-1"><Button size="sm">View Profile</Button><Button size="sm" variant="outline">Shortlist</Button></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
