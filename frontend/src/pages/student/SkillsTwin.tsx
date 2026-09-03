import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import {
  TrendingUp, Target, Award, Loader2,
} from 'lucide-react';
import { analyticsApi } from '@/api/analytics';

export default function SkillsTwin() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    analyticsApi.getStudentDashboard(user.id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load skill twin'))
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
        <p>{error || 'Unable to load skill twin'}</p>
      </div>
    );
  }

  const breakdown = data.competencyBreakdown || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Skill Twin</h1>
        <p className="text-gray-500 mt-1">Your living skill profile — levels, confidence, evidence sources, and next milestones.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <div className="text-sm text-gray-500">Tracked Skills</div>
          </div>
          <div className="text-3xl font-bold text-navy-900">{breakdown.length}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-600" />
            <div className="text-sm text-gray-500">Avg Proficiency</div>
          </div>
          <div className="text-3xl font-bold text-navy-900">{Math.round(data.stats.averageProficiency)}%</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div className="text-sm text-gray-500">Verified Evidence</div>
          </div>
          <div className="text-3xl font-bold text-navy-900">{data.stats.verifiedCompetencies}</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-navy-900 mb-4">Per-Skill Trajectory</h3>
        <div className="space-y-4">
          {breakdown.map((comp: any) => (
            <div key={comp.competencyId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-navy-900">{comp.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {comp.evidenceCount} evidence item{comp.evidenceCount !== 1 ? 's' : ''} • Confidence {Math.round(comp.confidence * 100)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-navy-900">{Math.round(comp.level)}%</div>
                  <div className="text-xs text-gray-500">{comp.band}</div>
                </div>
              </div>
              <ProgressBar value={comp.level} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Current level</span>
                <span>Next milestone: {Math.min(100, Math.round(comp.level) + 15)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
