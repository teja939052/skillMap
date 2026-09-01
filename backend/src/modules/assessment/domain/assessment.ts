import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError, ValidationError } from '../../../shared/domain/result.js';

export interface Question {
  id: string;
  competencyId: string;
  type: 'multiple_choice' | 'multi_select' | 'true_false' | 'short_answer' | 'coding';
  text: string;
  options?: Array<{ id: string; text: string }>;
  correctAnswer: string | string[];
  difficulty: number;
  points: number;
  explanation?: string;
}

export interface AssessmentProps {
  id: EntityId;
  title: string;
  description: string;
  competencyIds: string[];
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  cooldownHours: number;
  difficulty: 'adaptive' | 'fixed';
  isPublished: boolean;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Assessment extends AggregateRoot<EntityId> {
  readonly title: string;
  readonly description: string;
  readonly competencyIds: string[];
  private _questions: Question[];
  readonly timeLimit?: number;
  readonly passingScore: number;
  readonly maxAttempts: number;
  readonly cooldownHours: number;
  readonly difficulty: 'adaptive' | 'fixed';
  private _isPublished: boolean;
  private _status: 'draft' | 'published' | 'archived';
  readonly createdBy: string;
  readonly orgId: string;

  constructor(props: AssessmentProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.title = props.title;
    this.description = props.description;
    this.competencyIds = props.competencyIds;
    this._questions = props.questions;
    this.timeLimit = props.timeLimit;
    this.passingScore = props.passingScore;
    this.maxAttempts = props.maxAttempts;
    this.cooldownHours = props.cooldownHours;
    this.difficulty = props.difficulty;
    this._isPublished = props.isPublished;
    this._status = props.status;
    this.createdBy = props.createdBy;
    this.orgId = props.orgId;
  }

  get questions(): Question[] {
    return this._questions;
  }

  get isPublished(): boolean {
    return this._isPublished;
  }

  get status(): 'draft' | 'published' | 'archived' {
    return this._status;
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  publish(): Result<void> {
    if (this._status === 'published') {
      return err(new InvariantError('Assessment is already published'));
    }
    if (this._status === 'archived') {
      return err(new InvariantError('Cannot publish an archived assessment'));
    }
    if (this._questions.length === 0) {
      return err(new ValidationError('Cannot publish an assessment with no questions'));
    }
    this._status = 'published';
    this._isPublished = true;
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'AssessmentPublished',
        aggregateId: this.id.toString(),
        aggregateType: 'Assessment',
        payload: {
          assessmentId: this.id.toString(),
          title: this.title,
          questionCount: this._questions.length,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  archive(): Result<void> {
    if (this._status === 'archived') {
      return err(new InvariantError('Assessment is already archived'));
    }
    this._status = 'archived';
    this._isPublished = false;
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'AssessmentArchived',
        aggregateId: this.id.toString(),
        aggregateType: 'Assessment',
        payload: {
          assessmentId: this.id.toString(),
          title: this.title,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addQuestion(question: Question): Result<void> {
    if (this._status === 'archived') {
      return err(new InvariantError('Cannot modify an archived assessment'));
    }
    if (this._questions.some((q) => q.id === question.id)) {
      return err(new ValidationError(`Question with id ${question.id} already exists`));
    }
    if (question.difficulty < 1 || question.difficulty > 5) {
      return err(new ValidationError('Question difficulty must be between 1 and 5'));
    }
    if (question.points <= 0) {
      return err(new ValidationError('Question points must be positive'));
    }
    this._questions = [...this._questions, question];
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'QuestionAddedToAssessment',
        aggregateId: this.id.toString(),
        aggregateType: 'Assessment',
        payload: {
          assessmentId: this.id.toString(),
          questionId: question.id,
          competencyId: question.competencyId,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  removeQuestion(questionId: string): Result<void> {
    if (this._status === 'archived') {
      return err(new InvariantError('Cannot modify an archived assessment'));
    }
    const index = this._questions.findIndex((q) => q.id === questionId);
    if (index === -1) {
      return err(new ValidationError(`Question with id ${questionId} not found`));
    }
    this._questions = this._questions.filter((q) => q.id !== questionId);
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'QuestionRemovedFromAssessment',
        aggregateId: this.id.toString(),
        aggregateType: 'Assessment',
        payload: {
          assessmentId: this.id.toString(),
          questionId,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  getTotalPoints(): number {
    return this._questions.reduce((sum, q) => sum + q.points, 0);
  }

  stripCorrectAnswers(): Question[] {
    return this._questions.map((q) => ({
      ...q,
      correctAnswer: '',
      explanation: undefined,
    }));
  }
}

export interface Answer {
  questionId: string;
  answer: string | string[];
  timeSpent?: number;
}

export interface CompetencyScore {
  competencyId: string;
  score: number;
  questionsAnswered: number;
}

export interface AssessmentAttemptProps {
  id: EntityId;
  assessmentId: string;
  userId: string;
  answers: Answer[];
  score: number;
  percentage: number;
  passed: boolean;
  competencyScores: CompetencyScore[];
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned' | 'timed_out';
  orgId: string;
  // Versioning for reproducibility
  assessmentVersion?: number;
  questionVersion?: number;
  scoringVersion?: number;
  // Adaptive trace per competency: difficulty progression
  adaptiveTrace?: Record<string, number[]>;
  createdAt: Date;
  updatedAt: Date;
}

export class AssessmentAttempt extends AggregateRoot<EntityId> {
  readonly assessmentId: string;
  readonly userId: string;
  private _answers: Answer[];
  private _score: number;
  private _percentage: number;
  private _passed: boolean;
  private _competencyScores: CompetencyScore[];
  readonly startedAt: Date;
  private _completedAt?: Date;
  private _status: 'in_progress' | 'completed' | 'abandoned' | 'timed_out';
  readonly orgId: string;
  readonly assessmentVersion: number;
  readonly questionVersion: number;
  readonly scoringVersion: number;
  readonly adaptiveTrace?: Record<string, number[]>;

  constructor(props: AssessmentAttemptProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.assessmentId = props.assessmentId;
    this.userId = props.userId;
    this._answers = props.answers;
    this._score = props.score;
    this._percentage = props.percentage;
    this._passed = props.passed;
    this._competencyScores = props.competencyScores;
    this.startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._status = props.status;
    this.orgId = props.orgId;
    this.assessmentVersion = props.assessmentVersion ?? 1;
    this.questionVersion = props.questionVersion ?? 1;
    this.scoringVersion = props.scoringVersion ?? 2;
    this.adaptiveTrace = props.adaptiveTrace;
  }

  get answers(): Answer[] {
    return this._answers;
  }

  get score(): number {
    return this._score;
  }

  get percentage(): number {
    return this._percentage;
  }

  get passed(): boolean {
    return this._passed;
  }

  get competencyScores(): CompetencyScore[] {
    return this._competencyScores;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get status(): string {
    return this._status;
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  submit(): Result<void> {
    if (this._status === 'completed') {
      return err(new InvariantError('Attempt is already completed'));
    }
    if (this._status === 'abandoned') {
      return err(new InvariantError('Cannot submit an abandoned attempt'));
    }
    this._status = 'completed';
    this._completedAt = new Date();
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'AssessmentAttemptSubmitted',
        aggregateId: this.id.toString(),
        aggregateType: 'AssessmentAttempt',
        payload: {
          attemptId: this.id.toString(),
          assessmentId: this.assessmentId,
          userId: this.userId,
          score: this._score,
          percentage: this._percentage,
          passed: this._passed,
          competencyScores: this._competencyScores,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  abandon(): Result<void> {
    if (this._status === 'completed') {
      return err(new InvariantError('Cannot abandon a completed attempt'));
    }
    if (this._status === 'abandoned') {
      return err(new InvariantError('Attempt is already abandoned'));
    }
    this._status = 'abandoned';
    this._completedAt = new Date();
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'AssessmentAttemptAbandoned',
        aggregateId: this.id.toString(),
        aggregateType: 'AssessmentAttempt',
        payload: {
          attemptId: this.id.toString(),
          assessmentId: this.assessmentId,
          userId: this.userId,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  calculateScore(questions: Question[]): Result<void> {
    if (questions.length === 0) {
      return err(new ValidationError('Cannot calculate score with no questions'));
    }

    let totalEarned = 0;
    let totalPossible = 0;
    const competencyMap: Record<string, { earned: number; possible: number; answered: number }> = {};

    for (const question of questions) {
      totalPossible += question.points;
      const answer = this._answers.find((a) => a.questionId === question.id);

      if (!answer) continue;

      if (!competencyMap[question.competencyId]) {
        competencyMap[question.competencyId] = { earned: 0, possible: 0, answered: 0 };
      }
      competencyMap[question.competencyId].possible += question.points;
      competencyMap[question.competencyId].answered += 1;

      const isCorrect = this.evaluateAnswer(answer.answer, question.correctAnswer, question.type);
      if (isCorrect) {
        totalEarned += question.points;
        competencyMap[question.competencyId].earned += question.points;
      }
    }

    this._score = totalEarned;
    this._percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    this._competencyScores = Object.entries(competencyMap).map(([competencyId, data]) => ({
      competencyId,
      score: data.possible > 0 ? Math.round((data.earned / data.possible) * 100) : 0,
      questionsAnswered: data.answered,
    }));

    return ok(undefined);
  }

  private evaluateAnswer(
    userAnswer: string | string[],
    correctAnswer: string | string[],
    type: string
  ): boolean {
    if (type === 'multi_select') {
      const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      if (userArr.length !== correctArr.length) return false;
      const userSorted = [...userArr].sort();
      const correctSorted = [...correctArr].sort();
      return userSorted.every((val, idx) => val === correctSorted[idx]);
    }
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(userAnswer as string);
    }
    return userAnswer === correctAnswer;
  }
}

export interface QuestionBankProps {
  id: EntityId;
  competencyId: string;
  questions: Question[];
  totalQuestions: number;
  createdBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class QuestionBank extends AggregateRoot<EntityId> {
  readonly competencyId: string;
  private _questions: Question[];
  private _totalQuestions: number;
  readonly createdBy: string;
  readonly orgId: string;

  constructor(props: QuestionBankProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.competencyId = props.competencyId;
    this._questions = props.questions;
    this._totalQuestions = props.totalQuestions;
    this.createdBy = props.createdBy;
    this.orgId = props.orgId;
  }

  get questions(): Question[] {
    return this._questions;
  }

  get totalQuestions(): number {
    return this._totalQuestions;
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  addQuestion(question: Question): Result<void> {
    if (this._questions.some((q) => q.id === question.id)) {
      return err(new ValidationError(`Question with id ${question.id} already exists in bank`));
    }
    if (question.difficulty < 1 || question.difficulty > 5) {
      return err(new ValidationError('Question difficulty must be between 1 and 5'));
    }
    this._questions = [...this._questions, question];
    this._totalQuestions = this._questions.length;
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'QuestionAddedToBank',
        aggregateId: this.id.toString(),
        aggregateType: 'QuestionBank',
        payload: {
          bankId: this.id.toString(),
          questionId: question.id,
          competencyId: this.competencyId,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  removeQuestion(questionId: string): Result<void> {
    const index = this._questions.findIndex((q) => q.id === questionId);
    if (index === -1) {
      return err(new ValidationError(`Question with id ${questionId} not found in bank`));
    }
    this._questions = this._questions.filter((q) => q.id !== questionId);
    this._totalQuestions = this._questions.length;
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'QuestionRemovedFromBank',
        aggregateId: this.id.toString(),
        aggregateType: 'QuestionBank',
        payload: {
          bankId: this.id.toString(),
          questionId,
          competencyId: this.competencyId,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  getRandomQuestions(count: number, difficulty?: number): Result<Question[]> {
    let pool = this._questions;
    if (difficulty !== undefined) {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }
    if (pool.length === 0) {
      return err(new ValidationError('No questions available matching criteria'));
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    return ok(selected);
  }
}
