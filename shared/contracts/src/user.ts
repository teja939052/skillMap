import { z } from 'zod';

export const userRoleSchema = z.enum([
  'student',
  'faculty',
  'industry',
  'institution_admin',
  'platform_admin',
]);

export const userStatusSchema = z.enum(['active', 'inactive', 'suspended', 'pending_verification']);

export const createUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  name: z.string().min(1).max(100).trim(),
  role: userRoleSchema.default('student'),
  avatar: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
});

export const studentProfileSchema = z.object({
  userId: z.string(),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startYear: z.number(),
    endYear: z.number().optional(),
    gpa: z.number().min(0).max(10).optional(),
  })).default([]),
  careerGoals: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  availability: z.enum(['full_time', 'part_time', 'internship', 'not_available']).optional(),
  resumeUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
});

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  avatar: z.string().optional(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type StudentProfile = z.infer<typeof studentProfileSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
