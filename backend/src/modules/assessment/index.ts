export {
  Assessment,
  AssessmentAttempt,
  QuestionBank,
} from './domain/assessment.js';

export type {
  Question,
  AssessmentProps,
  AssessmentAttemptProps,
  QuestionBankProps,
  Answer,
  CompetencyScore,
} from './domain/assessment.js';

export {
  AssessmentRepository,
  AssessmentAttemptRepository,
  QuestionBankRepository,
} from './infrastructure/repositories.js';

export type {
  AssessmentDocument,
  AssessmentAttemptDocument,
  QuestionBankDocument,
} from './infrastructure/repositories.js';

export { AssessmentService } from './application/assessment-service.js';

export type {
  CreateAssessmentData,
  UpdateAssessmentData,
  ListAssessmentFilters,
  SubmitAttemptData,
  CreateQuestionData,
} from './application/assessment-service.js';

export { createAssessmentRouter } from './http/assessment-controller.js';
