import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Badge, Button, ProgressBar } from '@/components/ui';
import { IndianRupee, Clock, Percent, Layers } from 'lucide-react';
import { freelanceApi, type FreelanceTask } from '@/api/freelance';
import { notificationApi } from '@/api/notifications';
import { apiClient, getErrorMessage } from '@/api/client';

const DEMO_SKILLS = [
  { competencyId: 'demo-py', proficiency: 76, confidence: 0.97 },
  { competencyId: 'demo-sql', proficiency: 68, confidence: 0.93 },
];

export default function Earn() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['freelance', 'matched'],
    queryFn: () => freelanceApi.matched(DEMO_SKILLS, 10),
  });

  const applyMut = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.post(`/freelance/${taskId}/apply`);
      await notificationApi.markAllRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['freelance'] });
    },
  });

  const tasks: FreelanceTask[] = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Earn While You Learn</h1>
          <p className="text-gray-500 mt-1">
            Small industry micro-tasks matched to your current skills. Earn income, build real evidence, and grow your portfolio.
          </p>
        </div>
        <Badge variant="outline" className="whitespace-nowrap">
          <Layers className="w-3.5 h-3.5 mr-1" /> Skill-matched
        </Badge>
      </div>

      {error && <p className="text-red-600 text-sm">{getErrorMessage(error)}</p>}

      {isLoading ? (
        <p className="text-gray-500">Loading matched tasks…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <Card key={task.id} className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-navy-900">{task.title}</h3>
                  <span className="text-xs text-gray-500">{task.category}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <Percent className="w-4 h-4" />{task.matchScore ?? 0}%
                </div>
              </div>

              <p className="text-sm text-gray-600">{task.description}</p>

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-semibold text-navy-900">
                  <IndianRupee className="w-4 h-4" />{task.payout.toLocaleString('en-IN')}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />~{task.estimatedHours}h
                </span>
                <Badge size="sm" variant="outline">{task.status}</Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Skill readiness</span>
                  <span>{task.matchScore ?? 0}/100</span>
                </div>
                <ProgressBar value={task.matchScore ?? 0} max={100} size="sm" />
              </div>

              <div className="flex flex-wrap gap-1">
                {(task.matchedSkills ?? []).map((s) => (
                  <Badge key={s} size="sm" variant="default" className="!bg-green-100 !text-green-700">{s}</Badge>
                ))}
                {(task.missingSkills ?? []).map((s) => (
                  <Badge key={s} size="sm" variant="outline" className="!text-gray-400 line-through">{s}</Badge>
                ))}
              </div>

              <Button
                size="sm"
                className="mt-auto"
                disabled={applyMut.isPending}
                onClick={() => applyMut.mutate(task.id)}
              >
                {applyMut.isPending ? 'Applying…' : 'Apply & Earn'}
              </Button>
            </Card>
          ))}
          {tasks.length === 0 && !isLoading && <p className="text-gray-500">No matched tasks right now.</p>}
        </div>
      )}
    </div>
  );
}
