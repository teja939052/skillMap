export {
  Institution,
  Department,
  Program,
  Curriculum,
  CurriculumMapping,
  Cohort,
} from './domain/institution.js';

export type {
  InstitutionProps,
  InstitutionType,
  InstitutionStatus,
  DepartmentProps,
  DepartmentStatus,
  ProgramProps,
  ProgramType,
  ProgramStatus,
  CurriculumProps,
  CurriculumStatus,
  CurriculumCourse,
  CurriculumMappingProps,
  CohortProps,
  CohortStatus,
} from './domain/institution.js';

export {
  InstitutionRepository,
  DepartmentRepository,
  ProgramRepository,
  CurriculumRepository,
  CurriculumMappingRepository,
  CohortRepository,
} from './infrastructure/repositories.js';

export type {
  InstitutionDocument,
  DepartmentDocument,
  ProgramDocument,
  CurriculumDocument,
  CurriculumMappingDocument,
  CohortDocument,
} from './infrastructure/repositories.js';

export { InstitutionService } from './application/institution-service.js';

export type {
  CreateInstitutionData,
  UpdateInstitutionData,
  CreateDepartmentData,
  CreateProgramData,
  CreateCurriculumData,
  MapCompetencyData,
  CreateCohortData,
} from './application/institution-service.js';

export { createInstitutionRouter } from './http/institution-controller.js';
