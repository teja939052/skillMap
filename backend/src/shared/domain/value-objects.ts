import { z } from 'zod';

export const proficiencyBandSchema = z.enum([
  'awareness',
  'foundation',
  'working',
  'proficient',
  'advanced',
  'expert',
]);

export type ProficiencyBand = z.infer<typeof proficiencyBandSchema>;

export const proficiencyLevelSchema = z.number().int().min(0).max(100);

export type ProficiencyLevel = z.infer<typeof proficiencyLevelSchema>;

export function scoreToBand(score: ProficiencyLevel): ProficiencyBand {
  if (score < 25) return 'awareness';
  if (score < 50) return 'foundation';
  if (score < 70) return 'working';
  if (score < 85) return 'proficient';
  if (score < 95) return 'advanced';
  return 'expert';
}

export function bandLabel(band: ProficiencyBand): string {
  const labels: Record<ProficiencyBand, string> = {
    awareness: 'Awareness',
    foundation: 'Foundation',
    working: 'Working',
    proficient: 'Proficient',
    advanced: 'Advanced',
    expert: 'Expert',
  };
  return labels[band];
}

export const COMPETENCY_TYPES = [
  'skill',
  'knowledge',
  'tool',
  'technology',
  'behavioural',
  'certification',
  'domain',
] as const;

export type CompetencyType = (typeof COMPETENCY_TYPES)[number];

export const competencyTypeSchema = z.enum(COMPETENCY_TYPES);

export const EVIDENCE_TYPES = [
  'assessment',
  'project',
  'certification',
  'faculty_verification',
  'industry_verification',
  'experience',
  'self_declaration',
  'internship_outcome',
  'mentor_attestation',
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const evidenceTypeSchema = z.enum(EVIDENCE_TYPES);

export const VERIFICATION_STATUS = [
  'pending',
  'verified',
  'rejected',
  'expired',
  'superseded',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const verificationStatusSchema = z.enum(VERIFICATION_STATUS);

export const APPLICATION_STATUSES = [
  'draft',
  'applied',
  'under_review',
  'shortlisted',
  'interview',
  'offered',
  'accepted',
  'declined',
  'rejected',
  'withdrawn',
  'expired',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

export const OPPORTUNITY_TYPES = [
  'internship',
  'job',
  'project',
  'training',
  'fdp',
  'mentorship',
  'research',
  'consultancy',
  'workshop',
  'hackathon',
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const opportunityTypeSchema = z.enum(OPPORTUNITY_TYPES);

export const USER_ROLES = [
  'student',
  'faculty',
  'industry',
  'institution_admin',
  'platform_admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const userRoleSchema = z.enum(USER_ROLES);

export const MEMBERSHIP_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];
export const membershipRoleSchema = z.enum(MEMBERSHIP_ROLES);

export const ORGANIZATION_TYPES = ['institution', 'company'] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];
export const organizationTypeSchema = z.enum(ORGANIZATION_TYPES);

export const INTERVENTION_TYPES = [
  'workshop',
  'training',
  'project',
  'fdp',
  'bootcamp',
  'hackathon',
  'mentorship',
  'practice_plan',
] as const;

export type InterventionType = (typeof INTERVENTION_TYPES)[number];
export const interventionTypeSchema = z.enum(INTERVENTION_TYPES);

export function isValidTransition(
  current: string,
  next: string,
  allowedTransitions: Record<string, string[]>
): boolean {
  const allowed = allowedTransitions[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

export const APPLICATION_TRANSITIONS: Record<string, string[]> = {
  draft: ['applied'],
  applied: ['under_review', 'withdrawn', 'expired'],
  under_review: ['shortlisted', 'rejected', 'withdrawn'],
  shortlisted: ['interview', 'rejected', 'withdrawn'],
  interview: ['offered', 'rejected', 'withdrawn'],
  offered: ['accepted', 'declined'],
  accepted: [],
  declined: [],
  rejected: [],
  withdrawn: [],
  expired: [],
};

export const EVIDENCE_TRANSITIONS: Record<string, string[]> = {
  pending: ['verified', 'rejected', 'expired'],
  verified: ['superseded', 'expired'],
  rejected: [],
  expired: [],
  superseded: [],
};

export const OPPORTUNITY_TRANSITIONS: Record<string, string[]> = {
  draft: ['open', 'archived'],
  open: ['closed', 'archived'],
  closed: ['archived'],
  archived: [],
};

export const INTERVENTION_TRANSITIONS: Record<string, string[]> = {
  draft: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const MEMBERSHIP_TRANSITIONS: Record<string, string[]> = {
  active: ['suspended', 'removed'],
  suspended: ['active', 'removed'],
  removed: [],
};
