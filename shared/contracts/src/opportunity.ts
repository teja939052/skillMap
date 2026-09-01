import { z } from 'zod';

export const opportunityTypeSchema = z.enum([
  'internship',
  'job',
  'project',
  'training',
  'fdp',
  'mentorship',
  'research',
]);

export const opportunityStatusSchema = z.enum(['draft', 'open', 'closed', 'archived']);

export const opportunitySchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(10000),
  type: opportunityTypeSchema,
  organizationId: z.string(),
  location: z.string().max(200).optional(),
  isRemote: z.boolean().default(false),
  requirements: z.array(z.object({
    competencyId: z.string(),
    minLevel: z.number().int().min(0).max(5),
    weight: z.number().min(0).max(1).default(1),
  })).default([]),
  eligibility: z.object({
    minGpa: z.number().min(0).max(10).optional(),
    departments: z.array(z.string()).optional(),
    yearsOfStudy: z.array(z.number()).optional(),
    maxGraduationYear: z.number().optional(),
    minGraduationYear: z.number().optional(),
  }).optional(),
  compensation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('INR'),
    period: z.enum(['hour', 'day', 'week', 'month', 'total']).default('month'),
  }).optional(),
  deadline: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  duration: z.string().max(50).optional(),
  positions: z.number().int().min(1).default(1),
  status: opportunityStatusSchema.default('draft'),
});

export const updateOpportunitySchema = opportunitySchema.partial();

export const applicationSchema = z.object({
  opportunityId: z.string(),
  coverLetter: z.string().max(2000).optional(),
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([]),
});

export const applicationStatusSchema = z.enum([
  'submitted',
  'under_review',
  'shortlisted',
  'interview',
  'accepted',
  'rejected',
  'withdrawn',
]);

export const updateApplicationSchema = z.object({
  status: applicationStatusSchema,
  notes: z.string().max(500).optional(),
});

export const opportunityResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: opportunityTypeSchema,
  organizationId: z.string(),
  organizationName: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean(),
  requirements: z.array(z.object({
    competencyId: z.string(),
    minLevel: z.number(),
    weight: z.number(),
  })),
  eligibility: z.record(z.unknown()).optional(),
  compensation: z.record(z.unknown()).optional(),
  deadline: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  positions: z.number(),
  status: opportunityStatusSchema,
  applicantCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const applicationResponseSchema = z.object({
  id: z.string(),
  opportunityId: z.string(),
  applicantId: z.string(),
  status: applicationStatusSchema,
  coverLetter: z.string().optional(),
  answers: z.array(z.object({ question: z.string(), answer: z.string() })),
  matchScore: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OpportunityType = z.infer<typeof opportunityTypeSchema>;
export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type OpportunityResponse = z.infer<typeof opportunityResponseSchema>;
export type ApplicationResponse = z.infer<typeof applicationResponseSchema>;
