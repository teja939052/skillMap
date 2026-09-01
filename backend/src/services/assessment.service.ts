import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { PaginatedResult, Assessment, AssessmentAttempt } from '../types/index.js';

export const AssessmentService = {
  async create(data: { title: string; description?: string; competencyIds: string[]; questions: any[]; timeLimit?: number; passingScore?: number; maxAttempts?: number; cooldownHours?: number }, createdBy: string) {
    const collection = getCollection<Assessment>('assessments');
    const now = new Date();

    const assessment: Assessment = {
      _id: new ObjectId(),
      title: data.title,
      description: data.description || null,
      competencyIds: data.competencyIds.map((id) => new ObjectId(id)),
      questions: data.questions.map((q: any, idx: number) => ({
        id: q.id || `q_${idx}`,
        competencyId: new ObjectId(q.competencyId),
        type: q.type,
        text: q.text,
        options: q.options || null,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || 3,
        points: q.points || 1,
        explanation: q.explanation || null,
      })),
      timeLimit: data.timeLimit || null,
      passingScore: data.passingScore || 60,
      maxAttempts: data.maxAttempts || 3,
      cooldownHours: data.cooldownHours || 24,
      isPublished: false,
      createdBy: new ObjectId(createdBy),
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(assessment);
    return {
      id: assessment._id.toString(),
      title: assessment.title,
      questionCount: assessment.questions.length,
      passingScore: assessment.passingScore,
    };
  },

  async list(page: number, limit: number, publishedOnly = true): Promise<PaginatedResult<any>> {
    const collection = getCollection<Assessment>('assessments');
    const filter: Record<string, unknown> = { deletedAt: null };
    if (publishedOnly) filter.isPublished = true;

    const total = await collection.countDocuments(filter);
    const items = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .project({ questions: 0 })
      .toArray();

    return {
      items: items.map((a) => ({
        id: a._id.toString(),
        title: a.title,
        description: a.description,
        competencyIds: a.competencyIds.map((id: ObjectId) => id.toString()),
        questionCount: a.questions.length,
        timeLimit: a.timeLimit,
        passingScore: a.passingScore,
        maxAttempts: a.maxAttempts,
        isPublished: a.isPublished,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(assessmentId: string, includeQuestions = false) {
    const collection = getCollection<Assessment>('assessments');
    const projection = includeQuestions ? {} : { questions: { correctAnswer: 0, explanation: 0 } };
    const assessment = await collection.findOne(
      { _id: new ObjectId(assessmentId), deletedAt: null },
      { projection }
    );

    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    return {
      id: assessment._id.toString(),
      title: assessment.title,
      description: assessment.description,
      competencyIds: assessment.competencyIds.map((id) => id.toString()),
      questions: assessment.questions,
      timeLimit: assessment.timeLimit,
      passingScore: assessment.passingScore,
      maxAttempts: assessment.maxAttempts,
      cooldownHours: assessment.cooldownHours,
    };
  },

  async submitAttempt(assessmentId: string, userId: string, answers: Array<{ questionId: string; answer: string | string[] }>) {
    const assessment = await getCollection<Assessment>('assessments').findOne({
      _id: new ObjectId(assessmentId),
      deletedAt: null,
      isPublished: true,
    });

    if (!assessment) {
      throw new AppError('Assessment not found or not published', 404);
    }

    const attemptCollection = getCollection<AssessmentAttempt>('assessmentAttempts');
    const recentAttempts = await attemptCollection.countDocuments({
      assessmentId: new ObjectId(assessmentId),
      userId: new ObjectId(userId),
    });

    if (recentAttempts >= assessment.maxAttempts) {
      throw new AppError('Maximum attempts reached', 400);
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const competencyScores: Map<string, { earned: number; total: number }> = new Map();

    for (const question of assessment.questions) {
      totalPoints += question.points;
      const compScore = competencyScores.get(question.competencyId.toString()) || { earned: 0, total: 0 };
      compScore.total += question.points;
      competencyScores.set(question.competencyId.toString(), compScore);

      const userAnswer = answers.find((a) => a.questionId === question.id);
      if (!userAnswer) continue;

      const isCorrect = checkAnswer(question.correctAnswer, userAnswer.answer);
      if (isCorrect) {
        earnedPoints += question.points;
        compScore.earned += question.points;
        competencyScores.set(question.competencyId.toString(), compScore);
      }
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    const attempt: AssessmentAttempt = {
      _id: new ObjectId(),
      assessmentId: new ObjectId(assessmentId),
      userId: new ObjectId(userId),
      answers,
      score: earnedPoints,
      percentage,
      passed,
      competencyScores: Array.from(competencyScores.entries()).map(([compId, scores]) => ({
        competencyId: new ObjectId(compId),
        score: scores.total > 0 ? Math.round((scores.earned / scores.total) * 100) : 0,
        questionsAnswered: assessment.questions.filter((q) => q.competencyId.toString() === compId).length,
      })),
      startedAt: new Date(),
      completedAt: new Date(),
      createdAt: new Date(),
    };

    await attemptCollection.insertOne(attempt);

    if (passed) {
      const evidenceCollection = getCollection('evidence');
      for (const compScore of attempt.competencyScores) {
        await evidenceCollection.insertOne({
          _id: new ObjectId(),
          ownerId: new ObjectId(userId),
          competencyId: compScore.competencyId,
          type: 'assessment',
          title: `Assessment: ${assessment.title}`,
          description: `Scored ${compScore.score}%`,
          proficiencyLevel: Math.min(5, Math.ceil((compScore.score / 100) * 5)),
          score: compScore.score,
          artifactUrl: null,
          credentialId: null,
          issuer: null,
          issuedAt: new Date(),
          expiresAt: null,
          metadata: { assessmentId, attemptId: attempt._id.toString() },
          verificationStatus: 'verified',
          verifiedBy: null,
          verifiedAt: new Date(),
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return {
      id: attempt._id.toString(),
      score: earnedPoints,
      percentage,
      passed,
      competencyScores: attempt.competencyScores.map((cs) => ({
        competencyId: cs.competencyId.toString(),
        score: cs.score,
      })),
    };
  },

  async getUserAttempts(assessmentId: string, userId: string) {
    const collection = getCollection<AssessmentAttempt>('assessmentAttempts');
    const attempts = await collection
      .find({ assessmentId: new ObjectId(assessmentId), userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return attempts.map((a) => ({
      id: a._id.toString(),
      score: a.score,
      percentage: a.percentage,
      passed: a.passed,
      completedAt: a.completedAt,
    }));
  },
};

function checkAnswer(correct: string | string[], userAnswer: string | string[]): boolean {
  if (Array.isArray(correct) && Array.isArray(userAnswer)) {
    return correct.length === userAnswer.length && correct.every((a) => userAnswer.includes(a));
  }
  return correct === userAnswer;
}
