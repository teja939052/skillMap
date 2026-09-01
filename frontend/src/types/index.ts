import type { UserRole } from '@skill-map/contracts';

export type {
  UserRole,
  UserStatus,
  UserResponse,
  StudentProfile,
  UpdateUserInput,
  CompetencyType,
  ProficiencyLevel,
  CompetencyResponse,
  RoleBlueprintResponse,
  CompetencyMapping,
  AssessmentResponse,
  AttemptResponse,
  AssessmentAttemptInput,
  EvidenceType,
  VerificationStatus,
  EvidenceResponse,
  OpportunityType,
  OpportunityStatus,
  OpportunityResponse,
  ApplicationResponse,
  ApplicationStatus,
  InterventionType,
  InterventionStatus,
  InterventionResponse,
  OrganizationResponse,
  OrganizationType,
  MembershipRole,
  InviteMemberInput,
  ApiResponse,
  PaginatedResponse,
  Pagination,
} from '@skill-map/contracts';

export type { UserRole as Role } from '@skill-map/contracts';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalCompetencies: number;
  verifiedCompetencies: number;
  averageProficiency: number;
  assessmentsCompleted: number;
  opportunitiesApplied: number;
  matchScore: number;
}

export interface GapAnalysis {
  competencyId: string;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

export interface MatchResult {
  score: number;
  gaps: string[];
  strengths: string[];
}

export interface HeatmapData {
  department: string;
  competency: string;
  level: number;
  count: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
