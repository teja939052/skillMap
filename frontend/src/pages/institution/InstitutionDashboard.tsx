import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { Users, TrendingUp, Target, AlertTriangle, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { analyticsApi } from '@/api/analytics';
import type { InstitutionDashboardResponse, TopGap } from '@/api/analytics';

export default function InstitutionDashboard() {
  const [data, setData] = useState<InstitutionDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    analyticsApi.getInstitutionDashboard({})
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load institution dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-600 py-12">
        <p>{error || 'Unable to load institution dashboard'}</p>
      </div>
    );
  }

  const stats = [
    { label: 'Overall Readiness', value: `${Math.round(data.stats.overallReadiness)}%`, icon: TrendingUp, color: 'bg-blue-500', change: `${data.stats.readinessChange > 0 ? '+' : ''}${Math.round(data.stats.readinessChange)}% this semester` },
    { label: 'Total Students', value: data.stats.totalStudents.toLocaleString(), icon: Users, color: 'bg-green-500', change: `${data.stats.assessedStudents} assessed` },
    { label: 'Industry Alignment', value: `${Math.round(data.stats.demandAlignment)}%`, icon: Target, color: 'bg-purple-500', change: 'Demand vs supply' },
    { label: 'Active Interventions', value: data.interventions.length.toString(), icon: Zap, color: 'bg-amber-500', change: 'Ongoing programs' },
  ];

  const topGaps: TopGap[] = data.topGaps;
  void data.demandTrend; // used directly in render below

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Institution Overview</h1>
          <p className="text-gray-500 mt-1">Industry readiness analytics for your institution</p>
        </div>
        <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors">
          Export Report
        </button>
      </div>

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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">Readiness Trend</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <option>This Semester</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="space-y-3">
            {(data.readinessTrend.length > 0 ? data.readinessTrend : Array.from({ length: 6 }, (_, i) => ({ month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i], score: 60 + i * 7 }))).map((item) => (
              <div key={item.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8">{item.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className="bg-accent h-3 rounded-full transition-all" style={{ width: `${item.score}%` }} />
                </div>
                <span className="text-sm font-medium text-navy-900 w-10">{Math.round(item.score)}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">Industry Demand vs Supply</h3>
            <button className="text-sm text-accent font-medium flex items-center gap-1">
              View Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {(data.demandTrend.length > 0 ? data.demandTrend : []).slice(0, 4).map((item, idx) => {
              const values = Object.values(item).filter((v) => typeof v === 'number') as number[];
              const demand = values[0] ?? 70;
              const supply = values[1] ?? 45;
              const labels = ['Cloud', 'Docker', 'ML/AI', 'DevOps'];
              const name = labels[idx] || `Domain ${idx + 1}`;
              return (
                <div key={item.month + idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-navy-900">{name}</span>
                    <span className="text-xs text-gray-500">Gap: {Math.round(demand - supply)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: `${Math.min(demand, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{Math.round(demand)}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: `${Math.min(supply, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{Math.round(supply)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-navy-900">Largest Institutional Gaps</h3>
          </div>
          <button className="text-sm text-accent font-medium flex items-center gap-1">
            Open Gap Observatory <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {topGaps.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No significant gaps detected.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topGaps.map((gap) => (
              <div key={gap.name} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-navy-900">{gap.name}</span>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600 mb-1">{Math.round(gap.gap)}%</p>
                <p className="text-xs text-gray-500">{gap.studentsAffected} students below target</p>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(gap.gap, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-navy-900">Intervention Impact</h3>
          <button className="text-sm text-accent font-medium flex items-center gap-1">
            Manage Interventions <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {data.interventions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No intervention data yet. Interventions will appear here once outcomes are recorded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.interventions.map((item) => (
              <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-navy-900 mb-3">{item.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg Improvement</span>
                    <span className="font-medium text-green-600">+{Math.round(item.improvement)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success Rate</span>
                    <span className="font-medium">{Math.round(item.successRate * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
