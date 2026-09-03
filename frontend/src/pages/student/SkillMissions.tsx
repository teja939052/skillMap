import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui';
import {
  Target, CheckCircle2, PlayCircle, Loader2, ArrowRight,
} from 'lucide-react';
import { missionsApi, type SkillMission } from '@/api/missions';

export default function SkillMissions() {
  const user = useAuthStore((s) => s.user);
  const [missions, setMissions] = useState<SkillMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    missionsApi.getMyMissions()
      .then((res) => setMissions(res.data?.data || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load missions'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleAdvance = async (competencyId: string) => {
    await missionsApi.advanceMission(competencyId);
    setMissions((prev) =>
      prev.map((m) =>
        m.competencyId === competencyId && m.currentStep < m.steps.length - 1
          ? { ...m, currentStep: m.currentStep + 1 }
          : m.competencyId === competencyId
          ? { ...m, status: 'completed' as any }
          : m
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Skill Missions</h1>
        <p className="text-gray-500 mt-1">Structured paths to close your skill gaps — learn, practice, assess, build, verify.</p>
      </div>

      {missions.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No active missions</p>
          <p className="text-sm text-gray-500 mt-1">Use Gap Map to generate missions based on industry demand.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => {
            const step = mission.steps[mission.currentStep];
            const isComplete = mission.status === 'completed';
            return (
              <Card key={mission.competencyId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-navy-900 text-lg">{mission.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{mission.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${isComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isComplete ? 'Completed' : `Step ${mission.currentStep + 1}/${mission.steps.length}`}
                      </span>
                      <span className="text-xs text-gray-500">Target: {mission.targetLevel}</span>
                    </div>
                  </div>
                  {!isComplete && step && (
                    <button
                      onClick={() => handleAdvance(mission.competencyId)}
                      className="flex items-center gap-1 text-sm text-accent font-medium hover:underline"
                    >
                      {mission.currentStep === mission.steps.length - 1 ? 'Complete Mission' : 'Next Step'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!isComplete && step && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <PlayCircle className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-navy-900">{step.title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-500">{step.estimatedMinutes} min</span>
                      {step.evidenceRequired && (
                        <span className="text-xs text-amber-600 font-medium">Evidence required to advance</span>
                      )}
                    </div>
                  </div>
                )}
                {isComplete && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Mission complete — evidence submitted and verified.</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
