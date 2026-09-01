import { z } from 'zod';

export const interventionTypeSchema = z.enum([
  'workshop',
  'training',
  'project',
  'fdp',
  'bootcamp',
  'hackathon',
]);

export const interventionStatusSchema = z.enum(['draft', 'active', 'completed', 'cancelled']);

export const interventionSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(5000),
  type: interventionTypeSchema,
  organizationId: z.string(),
  competencyIds: z.array(z.string()).min(1),
  instructorId: z.string().optional(),
  partnerOrgId: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  capacity: z.number().int().min(1).optional(),
  location: z.string().max(200).optional(),
  isOnline: z.boolean().default(false),
  meetingUrl: z.string().url().optional(),
  status: interventionStatusSchema.default('draft'),
});

export const enrollInterventionSchema = z.object({
  interventionId: z.string(),
});

export const interventionResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: interventionTypeSchema,
  organizationId: z.string(),
  competencyIds: z.array(z.string()),
  instructorId: z.string().optional(),
  partnerOrgId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.number().optional(),
  enrolledCount: z.number().default(0),
  location: z.string().optional(),
  isOnline: z.boolean(),
  meetingUrl: z.string().optional(),
  status: interventionStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const outcomeSchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  interventionId: z.string().optional(),
  competencyId: z.string(),
  beforeLevel: z.number().int().min(0).max(5),
  afterLevel: z.number().int().min(0).max(5),
  beforeConfidence: z.number().min(0).max(1),
  afterConfidence: z.number().min(0).max(1),
  measuredAt: z.coerce.date(),
});

export type InterventionType = z.infer<typeof interventionTypeSchema>;
export type InterventionStatus = z.infer<typeof interventionStatusSchema>;
export type InterventionInput = z.infer<typeof interventionSchema>;
export type EnrollInterventionInput = z.infer<typeof enrollInterventionSchema>;
export type InterventionResponse = z.infer<typeof interventionResponseSchema>;
export type OutcomeInput = z.infer<typeof outcomeSchema>;
