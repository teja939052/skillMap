import type { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash: string | null;
  name: string;
  role: 'student' | 'faculty' | 'industry' | 'institution_admin' | 'platform_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  emailVerified: boolean;
  googleId: string | null;
  studentProfile: StudentProfile | null;
  lastLoginAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
    gpa?: number;
  }>;
  careerGoals: string[];
  interests: string[];
  availability?: 'full_time' | 'part_time' | 'internship' | 'not_available';
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface Organization {
  _id: ObjectId;
  name: string;
  slug: string;
  type: 'institution' | 'company';
  description: string | null;
  website: string | null;
  logo: string | null;
  location: string | null;
  industry: string | null;
  size: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  _id: ObjectId;
  userId: ObjectId;
  organizationId: ObjectId;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  department: string | null;
  joinedAt: Date;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Competency {
  _id: ObjectId;
  name: string;
  slug: string;
  type: 'skill' | 'sub_skill' | 'knowledge' | 'tool' | 'technology' | 'behavioural';
  parentId: ObjectId | null;
  description: string | null;
  domain: string | null;
  keywords: string[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleBlueprint {
  _id: ObjectId;
  title: string;
  organizationId: ObjectId | null;
  roleFamily: string | null;
  description: string | null;
  requirements: Array<{
    competencyId: ObjectId;
    level: number;
    weight: number;
    evidenceRule: string | null;
    freshness: number;
  }>;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assessment {
  _id: ObjectId;
  title: string;
  description: string | null;
  competencyIds: ObjectId[];
  questions: Question[];
  timeLimit: number | null;
  passingScore: number;
  maxAttempts: number;
  cooldownHours: number;
  isPublished: boolean;
  createdBy: ObjectId;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  competencyId: ObjectId;
  type: 'multiple_choice' | 'multi_select' | 'true_false' | 'short_answer' | 'coding';
  text: string;
  options: Array<{ id: string; text: string }> | null;
  correctAnswer: string | string[];
  difficulty: number;
  points: number;
  explanation: string | null;
}

export interface AssessmentAttempt {
  _id: ObjectId;
  assessmentId: ObjectId;
  userId: ObjectId;
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
  score: number;
  percentage: number;
  passed: boolean;
  competencyScores: Array<{
    competencyId: ObjectId;
    score: number;
    questionsAnswered: number;
  }>;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

export interface Evidence {
  _id: ObjectId;
  ownerId: ObjectId;
  competencyId: ObjectId;
  type: 'assessment' | 'project' | 'certification' | 'faculty_verification' | 'industry_verification' | 'experience';
  title: string;
  description: string | null;
  proficiencyLevel: number;
  score: number | null;
  artifactUrl: string | null;
  credentialId: string | null;
  issuer: string | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
  metadata: Record<string, unknown>;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedBy: ObjectId | null;
  verifiedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  _id: ObjectId;
  title: string;
  description: string;
  type: 'internship' | 'job' | 'project' | 'training' | 'fdp' | 'mentorship' | 'research';
  organizationId: ObjectId;
  location: string | null;
  isRemote: boolean;
  requirements: Array<{
    competencyId: ObjectId;
    minLevel: number;
    weight: number;
  }>;
  eligibility: {
    minGpa?: number;
    departments?: string[];
    yearsOfStudy?: number[];
    maxGraduationYear?: number;
    minGraduationYear?: number;
  } | null;
  compensation: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
  } | null;
  deadline: Date | null;
  startDate: Date | null;
  duration: string | null;
  positions: number;
  status: 'draft' | 'open' | 'closed' | 'archived';
  createdBy: ObjectId;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  _id: ObjectId;
  opportunityId: ObjectId;
  applicantId: ObjectId;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter: string | null;
  answers: Array<{ question: string; answer: string }>;
  matchScore: number | null;
  notes: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Intervention {
  _id: ObjectId;
  title: string;
  description: string;
  type: 'workshop' | 'training' | 'project' | 'fdp' | 'bootcamp' | 'hackathon';
  organizationId: ObjectId;
  competencyIds: ObjectId[];
  instructorId: ObjectId | null;
  partnerOrgId: ObjectId | null;
  startDate: Date;
  endDate: Date;
  capacity: number | null;
  enrolledUserIds: ObjectId[];
  location: string | null;
  isOnline: boolean;
  meetingUrl: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outcome {
  _id: ObjectId;
  userId: ObjectId | null;
  organizationId: ObjectId | null;
  interventionId: ObjectId | null;
  competencyId: ObjectId;
  beforeLevel: number;
  afterLevel: number;
  beforeConfidence: number;
  afterConfidence: number;
  measuredAt: Date;
  createdAt: Date;
}

export interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export interface AuditLog {
  _id: ObjectId;
  userId: ObjectId | null;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface RefreshToken {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface PasswordResetToken {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
