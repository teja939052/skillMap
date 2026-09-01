import { z } from 'zod';

export const evidenceTypeSchema = z.enum([
  'assessment',
  'project',
  'certification',
  'faculty_verification',
  'industry_verification',
  'experience',
]);

export const verificationStatusSchema = z.enum([
  'pending',
  'verified',
  'rejected',
  'expired',
]);

export const evidenceSchema = z.object({
  ownerId: z.string(),
  competencyId: z.string(),
  type: evidenceTypeSchema,
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  proficiencyLevel: z.number().int().min(0).max(5),
  score: z.number().min(0).max(100).optional(),
  artifactUrl: z.string().url().optional(),
  credentialId: z.string().max(100).optional(),
  issuer: z.string().max(200).optional(),
  issuedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const verifyEvidenceSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  notes: z.string().max(500).optional(),
});

export const evidenceResponseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  competencyId: z.string(),
  type: evidenceTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  proficiencyLevel: z.number(),
  score: z.number().optional(),
  artifactUrl: z.string().optional(),
  credentialId: z.string().optional(),
  issuer: z.string().optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  verificationStatus: verificationStatusSchema,
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EvidenceType = z.infer<typeof evidenceTypeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type EvidenceInput = z.infer<typeof evidenceSchema>;
export type VerifyEvidenceInput = z.infer<typeof verifyEvidenceSchema>;
export type EvidenceResponse = z.infer<typeof evidenceResponseSchema>;
