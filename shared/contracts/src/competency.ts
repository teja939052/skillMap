import { z } from 'zod';

export const competencyTypeSchema = z.enum([
  'skill',
  'sub_skill',
  'knowledge',
  'tool',
  'technology',
  'behavioural',
]);

export const proficiencyLevelSchema = z.number().int().min(0).max(5);

export const competencySchema = z.object({
  name: z.string().min(1).max(200).trim(),
  slug: z.string().min(1).max(200),
  type: competencyTypeSchema,
  parentId: z.string().optional(),
  description: z.string().max(1000).optional(),
  domain: z.string().max(100).optional(),
  keywords: z.array(z.string()).default([]),
});

export const updateCompetencySchema = competencySchema.partial();

export const roleBlueprintSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  organizationId: z.string().optional(),
  roleFamily: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  requirements: z.array(z.object({
    competencyId: z.string(),
    level: proficiencyLevelSchema,
    weight: z.number().min(0).max(1).default(1),
    evidenceRule: z.string().max(200).optional(),
    freshness: z.number().int().default(180),
  })).default([]),
  isActive: z.boolean().default(true),
});

export const competencyMappingSchema = z.object({
  sourceId: z.string(),
  sourceType: z.enum(['course', 'project', 'assessment', 'experience']),
  competencyId: z.string(),
  level: proficiencyLevelSchema.optional(),
  weight: z.number().min(0).max(1).default(1),
});

export const competencyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: competencyTypeSchema,
  parentId: z.string().optional(),
  description: z.string().optional(),
  domain: z.string().optional(),
  keywords: z.array(z.string()),
  children: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const roleBlueprintResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  organizationId: z.string().optional(),
  roleFamily: z.string().optional(),
  description: z.string().optional(),
  requirements: z.array(z.object({
    competencyId: z.string(),
    level: proficiencyLevelSchema,
    weight: z.number(),
    evidenceRule: z.string().optional(),
    freshness: z.number(),
  })),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CompetencyType = z.infer<typeof competencyTypeSchema>;
export type ProficiencyLevel = z.infer<typeof proficiencyLevelSchema>;
export type CompetencyInput = z.infer<typeof competencySchema>;
export type UpdateCompetencyInput = z.infer<typeof updateCompetencySchema>;
export type RoleBlueprintInput = z.infer<typeof roleBlueprintSchema>;
export type CompetencyMapping = z.infer<typeof competencyMappingSchema>;
export type CompetencyResponse = z.infer<typeof competencyResponseSchema>;
export type RoleBlueprintResponse = z.infer<typeof roleBlueprintResponseSchema>;
