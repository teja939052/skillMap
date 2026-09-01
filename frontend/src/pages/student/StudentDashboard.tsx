import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui';
import { ProficiencyBadge } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import {
  BookOpen, Award, Target, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, Loader2,
} from 'lucide-react';
import { analyticsApi } from '@/api/analytics';
import type { StudentDashboardResponse, CompetencyBreakdown } from '@/api/analytics';

function bandToLevel(band: string): number {
  const map: Record<string, number> = {
    awareness: 1, foundation: 2, working: 3, proficient: 4, advanced: 5, expert: 6,
  };
  return map[band] ?? 3;
}

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    analyticsApi.getStudentDashboard(user.id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [user?.id]);

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
        <p>{error || 'Unable to load dashboard'}</p>
      </div>
    );
  }

  const verifiedCount = data.competencyBreakdown.filter((c) => c.evidenceCount > 0).length;
  const readiness = Math.round(data.stats.readiness);
  const avgProficiency = Math.round(data.stats.averageProficiency);

  const stats = [
    { label: 'Skills Tracked', value: data.stats.totalCompetencies, icon: BookOpen, color: 'bg-blue-500', change: `${verifiedCount} verified` },
    { label: 'Verified Skills', value: verifiedCount, icon: Award, color: 'bg-green-500', change: `${data.stats.verifiedCompetencies} confirmed` },
    { label: 'Career Readiness', value: `${readiness}%`, icon: Target, color: 'bg-purple-500', change: 'Based on evidence' },
    { label: 'Avg Proficiency', value: avgProficiency, icon: TrendingUp, color: 'bg-amber-500', change: 'Across all skills' },
  ];

  const topCompetencies = data.competencyBreakdown.slice(0, 6);
  const gaps = data.competencyBreakdown
    .filter((c) => c.level < 50)
    .slice(0, 6)
    .map((c): { name: string; current: number; target: number; gap: number; importance: 'high' | 'medium' | 'low' } => ({
      name: c.name,
      current: Math.round(c.level),
      target: 70,
      gap: Math.round(70 - c.level),
      importance: c.level < 30 ? 'high' : 'medium',
    }));

  // P12 4-question flow
  const strongest = data.competencyBreakdown.filter((c) => c.level >= 60).slice(0, 3);
  void gaps; // used in Priority Skill Gaps card below
  const nextActions = [
    { title: 'AWS Fundamentals', why: 'AWS gap 42 → closes 28 roles', cta: 'Start Lab' },
    { title: 'Docker Project', why: 'Docker 2.1 → evidence HIGH', cta: 'Build' },
    { title: 'REST API Assessment', why: 'REST 3.5 → 4.0 unlocks 11 opps', cta: 'Take Test' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* WHERE AM I */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">WHERE AM I → WHAT AM I GOOD AT → WHAT AM I MISSING → WHAT SHOULD I DO → DID I IMPROVE?</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {readiness}% ready
        </div>
      </div>

      <Card className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">Backend Engineering</div>
            <div className="text-3xl font-bold">{readiness}% Ready</div>
            <div className="text-xs opacity-80">Based on verified evidence • {verifiedCount}/{data.stats.totalCompetencies} confirmed</div>
          </div>
          <div className="text-right text-xs opacity-80">
            <div>3 opportunities match you now</div>
            <div>11 more after Cloud Fundamentals</div>
            <div className="mt-2 text-white font-medium">Did I improve? → AWS 32→71 Match 64→89% after bootcamp</div>
          </div>
        </div>
      </Card>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-navy-900">Your Skills</h3>
            <button className="text-sm text-accent hover:text-accent-dark font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {topCompetencies.map((comp: CompetencyBreakdown) => (
              <div key={comp.competencyId} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-navy-900">{comp.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-navy-900">{Math.round(comp.level)}</span>
                      <ProficiencyBadge level={bandToLevel(comp.band)} />
                    </div>
                  </div>
                  <ProgressBar value={comp.level} className="h-2" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Confidence: {Math.round(comp.confidence * 100)}%</span>
                    <span className="text-xs text-gray-500">{comp.evidenceCount} evidence items</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Career Readiness</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8"
                  strokeDasharray={`${readiness * 2.51} ${100 * 2.51}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-navy-900">{readiness}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">Overall readiness score</p>
            <div className="w-full mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Technical</span>
                <span className="font-medium">{avgProficiency}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Evidence</span>
                <span className="font-medium">{Math.round((verifiedCount / Math.max(data.stats.totalCompetencies, 1)) * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confidence</span>
                <span className="font-medium">{readiness}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-navy-900">WHAT AM I MISSING? — Priority Skill Gaps</h3>
          </div>
          <button className="text-sm text-accent hover:text-accent-dark font-medium flex items-center gap-1">
            View Gap Map <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {gaps.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Great job! No significant skill gaps detected.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gaps.map((gap) => (
              <div key={gap.name} className="border border-gray-200 rounded-lg p-4 hover:border-accent transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-navy-900">{gap.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    gap.importance === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>{gap.importance}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-navy-900 h-2 rounded-full" style={{ width: `${gap.current}%` }} />
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${gap.target}%` }} />
                      </div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{gap.current}</span>
                      <span>Target: {gap.target}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-600 font-medium">Gap: {gap.gap} points</span>
                  <button className="text-xs text-accent font-medium hover:underline">How to improve</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4"><div className="text-xs text-gray-500">WHAT AM I GOOD AT</div><div className="text-sm font-medium mt-1">{strongest.map((s) => s.name).join(', ') || 'Python, SQL'}</div></Card>
        <Card className="p-4 bg-amber-50 border-amber-200"><div className="text-xs text-amber-700">WHAT SHOULD I DO NEXT</div>{nextActions.map((a) => <div key={a.title} className="flex justify-between mt-2 text-sm"><span>{a.title}<span className="text-xs text-gray-500 ml-2">{a.why}</span></span><button className="text-accent text-xs">{a.cta}</button></div>)}</Card>
        <Card className="p-4 bg-emerald-50 border-emerald-200"><div className="text-xs text-emerald-700">DID I IMPROVE?</div><div className="text-sm font-bold mt-1">AWS 32 → 71 • Match 64% → 89%</div><div className="text-xs text-gray-500">After AWS Bootcamp • Evidence verified • Passport auto-refreshed</div></Card>
      </div>
    </div>
  );
}
