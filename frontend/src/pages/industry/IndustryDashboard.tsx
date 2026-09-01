import { Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import { Users, Briefcase, Target, ArrowRight, Search, Award } from 'lucide-react';

export default function IndustryDashboard() {
  const stats = [
    { label: 'Active Opportunities', value: '12', icon: Briefcase, color: 'bg-blue-500', change: '+3 this month' },
    { label: 'Applications Received', value: '245', icon: Users, color: 'bg-green-500', change: '+67 this week' },
    { label: 'Avg Match Score', value: '72', icon: Target, color: 'bg-purple-500', change: '+5% this month' },
    { label: 'Qualified Candidates', value: '38', icon: Award, color: 'bg-amber-500', change: '12 new this week' },
  ];

  const topCandidates = [
    { name: 'Rahul Sharma', role: 'Backend Engineer', match: 93, institution: 'IIT Delhi', evidence: 'high' },
    { name: 'Priya Patel', role: 'Full Stack Developer', match: 89, institution: 'BITS Pilani', evidence: 'high' },
    { name: 'Arjun Mehta', role: 'DevOps Engineer', match: 85, institution: 'NIT Trichy', evidence: 'medium' },
    { name: 'Sneha Reddy', role: 'Data Engineer', match: 82, institution: 'IIIT Hyderabad', evidence: 'high' },
  ];

  const demandTrend = [
    { month: 'Jan', applications: 45 },
    { month: 'Feb', applications: 52 },
    { month: 'Mar', applications: 61 },
    { month: 'Apr', applications: 58 },
    { month: 'May', applications: 73 },
    { month: 'Jun', applications: 85 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Industry Dashboard</h1>
          <p className="text-gray-500 mt-1">Talent pipeline and workforce intelligence</p>
        </div>
        <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors">
          Post Opportunity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-navy-900 mt-1">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-2.5 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">Application Trends</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="space-y-3">
            {demandTrend.map((item) => (
              <div key={item.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8">{item.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className="bg-accent h-3 rounded-full transition-all" style={{ width: `${(item.applications / 100) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-navy-900 w-10">{item.applications}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Demand Areas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">Top Demand Areas</h3>
            <button className="text-sm text-accent font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Cloud Engineering', demand: 92, growth: 34 },
              { name: 'Data Engineering', demand: 85, growth: 27 },
              { name: 'AI/ML', demand: 78, growth: 22 },
              { name: 'DevOps', demand: 72, growth: 18 },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-navy-900">{item.name}</span>
                    <span className="text-xs text-green-600">+{item.growth}%</span>
                  </div>
                  <ProgressBar value={item.demand} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Candidates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-navy-900">Top Matched Candidates</h3>
          </div>
          <button className="text-sm text-accent font-medium flex items-center gap-1">
            Open Candidate Discovery <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 text-sm font-medium text-gray-500">Candidate</th>
                <th className="text-left pb-3 text-sm font-medium text-gray-500">Target Role</th>
                <th className="text-left pb-3 text-sm font-medium text-gray-500">Institution</th>
                <th className="text-left pb-3 text-sm font-medium text-gray-500">Match</th>
                <th className="text-left pb-3 text-sm font-medium text-gray-500">Evidence</th>
                <th className="text-right pb-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topCandidates.map((c) => (
                <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-navy-700">{c.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <span className="text-sm font-medium text-navy-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{c.role}</td>
                  <td className="py-3 text-sm text-gray-600">{c.institution}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${c.match}%` }} />
                      </div>
                      <span className="text-sm font-medium text-navy-900">{c.match}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      c.evidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{c.evidence}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sm text-accent font-medium hover:underline mr-3">View</button>
                    <button className="text-sm bg-accent text-white px-3 py-1 rounded hover:bg-accent-dark">Shortlist</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
