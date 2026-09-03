import { apiClient } from './client';

export interface StudentDashboardStats {
  totalCompetencies: number;
  verifiedCompetencies: number;
  averageProficiency: number;
  readiness: number;
}

export interface CompetencyBreakdown {
  competencyId: string;
  name: string;
  level: number;
  confidence: number;
  band: string;
  evidenceCount: number;
}

export interface StudentDashboardResponse {
  stats: StudentDashboardStats;
  competencyBreakdown: CompetencyBreakdown[];
  readinessTrend: Array<{ month: string; score: number }>;
}

export interface InstitutionDashboardStats {
  overallReadiness: number;
  totalStudents: number;
  assessedStudents: number;
  demandAlignment: number;
  readinessChange: number;
}

export interface TopGap {
  name: string;
  gap: number;
  studentsAffected: number;
  priority: number;
  demandOpportunities: number;
}

export interface InstitutionDashboardResponse {
  stats: InstitutionDashboardStats;
  topGaps: TopGap[];
  topStrengths: Array<{ competencyName: string; averageLevel: number }>;
  interventions: Array<{
    name: string;
    improvement: number;
    successRate: number;
  }>;
  readinessTrend: Array<{ month: string; score: number }>;
  demandTrend: Array<{ month: string; cloud: number; docker: number; ml: number }>;
  demandSignals: Array<{ competency: string; opportunities: number; growth: number }>;
}

export const analyticsApi = {
  async getStudentDashboard(userId: string, competencies?: string[]): Promise<StudentDashboardResponse> {
    const params: Record<string, string> = {};
    if (competencies?.length) params.competencies = competencies.join(',');
    const response = await apiClient.get<{ success: true; data: StudentDashboardResponse }>(
      `/analytics/student/${userId}`,
      { params }
    );
    return response.data.data;
  },

  async getInstitutionDashboard(query: Record<string, string | undefined>): Promise<InstitutionDashboardResponse> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params[key] = value;
    }
    const response = await apiClient.get<{ success: true; data: InstitutionDashboardResponse }>(
      '/analytics/institution',
      { params }
    );
    return response.data.data;
  },

  async getSkillGaps(institutionId: string, requirements?: unknown) {
    const params: Record<string, string> = { institutionId };
    if (requirements) params.requirements = JSON.stringify(requirements);
    const response = await apiClient.get('/analytics/gaps', { params });
    return response.data;
  },

  async getInterventionOutcomes(interventionId: string) {
    const response = await apiClient.get(`/analytics/outcomes/${interventionId}`);
    return response.data;
  },

  async getDemandSignals(region?: string) {
    const params: Record<string, string> = {};
    if (region) params.region = region;
    const response = await apiClient.get('/analytics/demand', { params });
    return response.data;
  },

  async getDemandRadar(region?: string) {
    const params: Record<string, string> = {};
    if (region) params.region = region;
    const response = await apiClient.get('/analytics/demand-radar', { params });
    return response.data;
  },

  async getGapObservatory(institutionId?: string, region?: string) {
    const params: Record<string, string> = {};
    if (institutionId) params.institutionId = institutionId;
    if (region) params.region = region;
    const response = await apiClient.get('/analytics/gap-observatory', { params });
    return response.data;
  },
};
