import { z } from 'zod';

export const organizationTypeSchema = z.enum(['institution', 'company']);

export const organizationSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  type: organizationTypeSchema,
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  location: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.enum(['1-50', '51-200', '201-1000', '1001-5000', '5000+']).optional(),
});

export const updateOrganizationSchema = organizationSchema.partial();

export const membershipRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);

export const membershipSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  role: membershipRoleSchema.default('member'),
  department: z.string().max(100).optional(),
  joinedAt: z.string(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: membershipRoleSchema.default('member'),
  department: z.string().max(100).optional(),
});

export const organizationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: organizationTypeSchema,
  description: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  memberCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OrganizationType = z.infer<typeof organizationTypeSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type MembershipRole = z.infer<typeof membershipRoleSchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type OrganizationResponse = z.infer<typeof organizationResponseSchema>;
