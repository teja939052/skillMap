export const APP_NAME = 'Skill Map';
export const APP_VERSION = '1.0.0';
export const API_VERSION = 'v1';

export const PROFICIENCY_LEVELS = [
  { level: 0, label: 'Unassessed', description: 'No reliable evidence' },
  { level: 1, label: 'Aware', description: 'Can explain basic concepts with assistance' },
  { level: 2, label: 'Foundation', description: 'Can complete guided tasks' },
  { level: 3, label: 'Competent', description: 'Can solve standard problems independently' },
  { level: 4, label: 'Advanced', description: 'Can design, troubleshoot and optimize' },
  { level: 5, label: 'Expert', description: 'Can lead, mentor and solve novel problems' },
] as const;

export const EVIDENCE_FRESHNESS_DAYS = 180;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const JWT_ACCESS_TTL = '15m';
export const JWT_REFRESH_TTL = '7d';

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  INDUSTRY: 'industry',
  INSTITUTION_ADMIN: 'institution_admin',
  PLATFORM_ADMIN: 'platform_admin',
} as const;

export const PERMISSIONS = {
  READ_OWN_PROFILE: 'read:own_profile',
  UPDATE_OWN_PROFILE: 'update:own_profile',
  MANAGE_ORG: 'manage:org',
  READ_ORG: 'read:org',
  MANAGE_COMPETENCY: 'manage:competency',
  READ_COMPETENCY: 'read:competency',
  MANAGE_ASSESSMENT: 'manage:assessment',
  TAKE_ASSESSMENT: 'take:assessment',
  MANAGE_EVIDENCE: 'manage:evidence',
  VERIFY_EVIDENCE: 'verify:evidence',
  MANAGE_OPPORTUNITY: 'manage:opportunity',
  APPLY_OPPORTUNITY: 'apply:opportunity',
  MANAGE_INTERVENTION: 'manage:intervention',
  ENROLL_INTERVENTION: 'enroll:intervention',
  ADMIN_ACCESS: 'admin:access',
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  student: [
    'read:own_profile', 'update:own_profile',
    'read:competency', 'take:assessment',
    'manage:evidence', 'apply:opportunity',
    'enroll:intervention',
  ],
  faculty: [
    'read:own_profile', 'update:own_profile',
    'read:competency', 'manage:assessment',
    'manage:evidence', 'verify:evidence',
    'manage:intervention',
  ],
  industry: [
    'read:own_profile', 'update:own_profile',
    'read:competency', 'manage:opportunity',
    'verify:evidence',
  ],
  institution_admin: [
    'read:own_profile', 'update:own_profile',
    'manage:org', 'read:org',
    'read:competency', 'manage:assessment',
    'manage:evidence', 'verify:evidence',
    'manage:opportunity', 'manage:intervention',
  ],
  platform_admin: ['*'],
};
