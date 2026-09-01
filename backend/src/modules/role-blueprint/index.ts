export {
  RoleBlueprint,
  ROLE_BLUEPRINT_TRANSITIONS,
} from './domain/role-blueprint.js';

export type {
  RoleRequirement,
  EligibilityRules,
  RoleBlueprintStatus,
  RoleBlueprintProps,
} from './domain/role-blueprint.js';

export { RoleBlueprintRepository } from './infrastructure/repositories.js';

export type { RoleBlueprintDocument } from './infrastructure/repositories.js';

export { RoleBlueprintService } from './application/role-blueprint-service.js';

export type {
  CreateBlueprintData,
  UpdateBlueprintData,
  ListBlueprintFilters,
  StudentCompetencyInput,
  CompetencyMatchDetail,
  MatchAnalysisResult,
} from './application/role-blueprint-service.js';

export { createRoleBlueprintRouter } from './http/role-blueprint-controller.js';
