import { z } from 'zod';

export const questionTypeSchema = z.enum(['multiple_choice', 'multi_select', 'true_false', 'short_answer', 'coding']);

export const questionSchema = z.object({
  competencyId: z.string(),
  type: questionTypeSchema,
  text: z.string().min(1).max(2000),
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1).max(500),
  })).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  difficulty: z.number().int().min(1).max(5).default(3),
  points: z.number().int().min(1).default(1),
  explanation: z.string().max(1000).optional(),
});

export const assessmentSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  competencyIds: z.array(z.string()).min(1),
  questions: z.array(questionSchema).min(1),
  timeLimit: z.number().int().optional(),
  passingScore: z.number().min(0).max(100).default(60),
  maxAttempts: z.number().int().min(1).default(3),
  cooldownHours: z.number().int().min(0).default(24),
  isPublished: z.boolean().default(false),
});

export const assessmentAttemptSchema = z.object({
  assessmentId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.array(z.string())]),
  })),
});

export const assessmentResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  competencyIds: z.array(z.string()),
  questionCount: z.number(),
  timeLimit: z.number().optional(),
  passingScore: z.number(),
  maxAttempts: z.number(),
  cooldownHours: z.number(),
  isPublished: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const attemptResponseSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  userId: z.string(),
  score: z.number(),
  percentage: z.number(),
  passed: z.boolean(),
  competencyScores: z.array(z.object({
    competencyId: z.string(),
    score: z.number(),
    questionsAnswered: z.number(),
  })),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Question = z.infer<typeof questionSchema>;
export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type AssessmentAttemptInput = z.infer<typeof assessmentAttemptSchema>;
export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;
export type AttemptResponse = z.infer<typeof attemptResponseSchema>;
