import { useQuery } from '@tanstack/react-query';
import { evidenceApi } from '@/api/evidence';
import { assessmentApi } from '@/api/assessment';
import { userApi } from '@/api/user';

export function useAnalytics() {
  const evidenceQuery = useQuery({
    queryKey: ['analytics', 'evidence-summary'],
    queryFn: async () => {
      const response = await evidenceApi.getEvidence({ page: 1, limit: 100, order: 'desc' });
      return response.data;
    },
  });

  const assessmentsQuery = useQuery({
    queryKey: ['analytics', 'assessment-summary'],
    queryFn: async () => {
      const response = await assessmentApi.getAttempts({ page: 1, limit: 100, order: 'desc' });
      return response.data;
    },
  });

  const profileQuery = useQuery({
    queryKey: ['analytics', 'profile'],
    queryFn: async () => {
      const response = await userApi.getProfile();
      return response.data;
    },
  });

  return {
    evidence: evidenceQuery.data,
    assessments: assessmentsQuery.data,
    profile: profileQuery.data,
    isLoading: evidenceQuery.isLoading || assessmentsQuery.isLoading || profileQuery.isLoading,
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [evidenceRes, attemptsRes] = await Promise.all([
        evidenceApi.getEvidence({ page: 1, limit: 100, order: 'desc' }),
        assessmentApi.getAttempts({ page: 1, limit: 100, order: 'desc' }),
      ]);

      const evidence = evidenceRes.data?.items ?? [];
      const attempts = attemptsRes.data?.items ?? [];

      const verifiedCount = evidence.filter((e) => e.verificationStatus === 'verified').length;
      const avgProficiency = evidence.length > 0
        ? evidence.reduce((sum, e) => sum + e.proficiencyLevel, 0) / evidence.length
        : 0;

      return {
        totalCompetencies: evidence.length,
        verifiedCompetencies: verifiedCount,
        averageProficiency: Math.round(avgProficiency * 10) / 10,
        assessmentsCompleted: attempts.length,
        opportunitiesApplied: 0,
        matchScore: 0,
      };
    },
  });
}
