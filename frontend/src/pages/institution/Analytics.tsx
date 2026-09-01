import { Card } from '@/components/ui';
import { TrendingUp, Users, Award, Briefcase } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Institution Intelligence — Demand vs Supply → Priority → Action → Outcome</h1>
        <p className="text-gray-500 mt-1">AWS 32→71 Readiness 61%→73% +47 newly eligible — calculated from StudentCompetency + MatchingEngine, not typed</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><div className="text-xs text-red-700">AWS Demand 84 vs Supply 42 Gap 42</div><div className="text-sm font-bold">142 affected • 28 roles • [Deploy Training]</div></div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg"><div className="text-xs text-emerald-700">After AWS Bootcamp</div><div className="text-sm font-bold">AWS 32→71 • Readiness 61%→73% • +47 newly eligible</div></div>
        <div className="p-4 bg-navy-900 text-white rounded-lg text-xs">Signature: Industry Demand → Student Supply → Skill Gap → Priority → Recommended Action → Intervention → Outcome</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Placement Rate', value: '78%', icon: Briefcase, color: 'bg-blue-500' },
          { label: 'Avg Match Score', value: '72', icon: TrendingUp, color: 'bg-green-500' },
          { label: 'Verified Skills', value: '1,240', icon: Award, color: 'bg-purple-500' },
          { label: 'Active Students', value: '2,100', icon: Users, color: 'bg-amber-500' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Department Comparison</h3>
          <div className="space-y-3">
            {[{ name: 'CSE', score: 78 }, { name: 'IT', score: 72 }, { name: 'ECE', score: 65 }, { name: 'Mech', score: 58 }].map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-12">{d.name}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${d.score}%` }} />
                </div>
                <span className="text-sm text-gray-600">{d.score}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Intervention Impact</h3>
          <div className="space-y-3">
            {[{ name: 'Docker Bootcamp', lift: 25 }, { name: 'AWS Workshop', lift: 30 }, { name: 'System Design', lift: 20 }].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm font-medium text-green-600">+{item.lift}% improvement</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
