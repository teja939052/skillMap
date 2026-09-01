export {
  FacultyProfile,
  ResearchProject,
  Mentorship,
  ConsultancyProject,
  FDP,
} from './domain/faculty.js';

export type {
  FacultyTitle,
  AvailabilityStatus,
  FacultyStatus,
  ExpertiseEntry,
  IndustryExposureEntry,
  FacultyProfileProps,
  ResearchProjectStatus,
  ResearchProjectProps,
  MentorshipStatus,
  MentorshipProps,
  ConsultancyStatus,
  ConsultancyProjectProps,
  FDPType,
  FDPStatus,
  FDPProps,
} from './domain/faculty.js';

export {
  FacultyProfileRepository,
  ResearchProjectRepository,
  MentorshipRepository,
  ConsultancyRepository,
  FDPOfferingRepository,
} from './infrastructure/repositories.js';

export type {
  FacultyProfileDocument,
  ResearchProjectDocument,
  MentorshipDocument,
  ConsultancyDocument,
  FDPDocument,
} from './infrastructure/repositories.js';

export { FacultyService } from './application/faculty-service.js';

export type {
  CreateProfileData,
  UpdateProfileData,
  CreateResearchProjectData,
  CreateMentorshipData,
  CreateConsultancyData,
  CreateFDPData,
} from './application/faculty-service.js';

export { createFacultyRouter } from './http/faculty-controller.js';
