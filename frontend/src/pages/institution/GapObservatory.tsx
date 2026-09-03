import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, Button, Badge } from '@/components/ui';
import { AlertTriangle, TrendingUp, Zap, ArrowRight, Target, Users } from 'lucide-react';
import { analyticsApi } from '@/api/analytics';
import { apiClient } from '@/api/client';
import { useState } from 'react';

type Gap = {
  competencyId: string;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  studentsAffected: number;
  importance: string;
  demandOpportunities: number;
  recommendation: string;
};

export default function GapObservatory() {
  const [deploying, setDeploying] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['gap-observatory'],
    queryFn: async () => {
      const res = await analyticsApi.getGapObservatory('demo');
      return res.data as { items: Gap[] };
    },
  });

  const gaps = (data?.items || []).slice(0, 6);
  const topGap: Gap | undefined = gaps[0];
  const criticalCount = gaps.filter(g => g.importance === 'must_have' && g.gap > 30).length;

  const deployMutation = useMutation({
    mutationFn: async (gap: Gap) => {
      const now = new Date();
      const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const createRes = await apiClient.post('/interventions', {
        title: `${gap.competencyName} — Micro-Credential Bootcamp`,
        description: gap.recommendation,
        type: 'bootcamp',
        competencyIds: [gap.competencyId],
        competencyTargets: [{ competencyId: gap.competencyId, targetLevel: gap.targetLevel }],
        startDate: now.toISOString(),
        endDate: end.toISOString(),
        capacity: gap.studentsAffected || 150,
        orgId: 'demo-org',
      });
      const id = createRes.data.data?._id || createRes.data.data?.id || createRes.data._id || createRes.data.id;
      if (id) {
        await apiClient.post(`/interventions/${id}/publish`);
      }
      return createRes.data;
    },
    onSuccess: () => setDeploying(null),
  });

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Calculating demand vs supply…</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error instanceof Error ? error.message : 'Failed to load gap observatory'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Gap Observatory</h1>
          <p className="text-gray-500 mt-1">Live Industry Demand vs Institutional Supply — with recommended interventions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-50 text-red-700 border-red-200">{criticalCount} critical gaps</Badge>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">Source: live-demand-vs-supply</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-gray-500">Industry Demand (weighted)</div>
          <div className="text-2xl font-bold mt-1">84 <span className="text-sm font-normal text-red-600">↑ 34%</span></div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500">Institution Supply (avg)</div>
          <div className="text-2xl font-bold mt-1">42</div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50/50">
          <div className="text-xs text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Priority Gap</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{topGap?.competencyName || 'N/A'}</div>
          <div className="text-xs text-red-600">{topGap ? `${topGap.gap} pts • ${topGap.studentsAffected} students • ${topGap.demandOpportunities} open roles` : 'No data'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500">Demand Alignment</div>
          <div className="text-2xl font-bold mt-1">58%</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +11 pts after interventions</div>
        </Card>
      </div>

      {topGap && (
        <Card className="p-6 border-amber-200 bg-amber-50/60">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white"><Zap className="w-5 h-5" /></div>
              <div>
                <div className="text-sm font-semibold text-amber-900">Critical Skill Gap — Immediate Intervention Recommended</div>
                <div className="text-sm text-amber-800 mt-1">
                  <span className="font-bold">{topGap.competencyName}</span> is demanded by <span className="font-bold">{topGap.demandOpportunities} active opportunities</span> but only <span className="font-bold">{topGap.currentLevel}/100</span> average proficiency.
                  <span className="ml-2 px-2 py-0.5 rounded bg-white text-amber-700 text-xs border">{topGap.studentsAffected} students affected</span>
                </div>
                <div className="text-xs text-amber-700 mt-2">Recommended: <span className="font-medium">{topGap.recommendation}</span></div>
              </div>
            </div>
            <Button onClick={() => { setDeploying(topGap.competencyId); deployMutation.mutate(topGap); }} disabled={!!deploying} className="bg-amber-600 hover:bg-amber-700 text-white">
              {deploying === topGap.competencyId ? 'Deploying…' : 'Deploy Intervention'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><Target className="w-4 h-4" /> Demand vs Supply Heatmap</h2>
          <span className="text-xs text-gray-500">Gap × importance × demand = priority</span>
        </div>
        <div className="space-y-4">
          {gaps.map((g) => {
            const severity = g.gap > 40 ? 'critical' : g.gap > 30 ? 'high' : 'medium';
            return (
              <div key={g.competencyId} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-900 min-w-[200px]">{g.competencyName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 hidden md:inline">demand {g.demandOpportunities} roles</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">supply {g.currentLevel}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-navy-900 font-semibold">demand {g.targetLevel}</span>
                    <span className="flex items-center gap-1 text-red-600 font-medium"><AlertTriangle className="w-3 h-3" />gap {g.gap}</span>
                  </div>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, g.currentLevel)}%` }} />
                  <div className="h-full bg-red-400/70" style={{ width: `${Math.min(100 - g.currentLevel, g.gap)}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-navy-900" style={{ left: `${g.targetLevel}%` }} title={`Target ${g.targetLevel}`} />
                </div>
                <div className="flex justify-between mt-1 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.studentsAffected} students below target</span>
                  <span>0</span>
                  <span>100 target</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {deployMutation.isSuccess && (
        <Card className="p-4 bg-emerald-50 border-emerald-200 text-emerald-800 text-sm">Intervention deployed — students notified and enrolled.</Card>
      )}
      {deployMutation.isError && (
        <Card className="p-4 bg-red-50 border-red-200 text-red-700 text-sm">{deployMutation.error instanceof Error ? deployMutation.error.message : 'Deployment failed'}</Card>
      )}
    </div>
  );
}
