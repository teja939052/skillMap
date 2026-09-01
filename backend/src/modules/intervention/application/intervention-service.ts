import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, NotFoundError, ConflictError, ValidationError } from '../../../shared/domain/result.js';
import { Intervention, Enrollment, Outcome } from '../domain/intervention.js';
import {
  InterventionRepository,
  EnrollmentRepository,
  OutcomeRepository,
} from '../infrastructure/repositories.js';

export interface CreateInterventionData {
  title: string;
  description: string;
  type: string;
  competencyIds: string[];
  competencyTargets?: Array<{ competencyId: string; targetLevel: number }>;
  startDate: Date;
  endDate: Date;
  capacity: number;
  orgId: string;
}

export interface UpdateEnrollmentStatusData {
  status: string;
  notes?: string;
}

export interface RecordOutcomeData {
  interventionId: string;
  studentId: string;
  competencyId: string;
  beforeLevel: number;
  afterLevel: number;
  beforeConfidence: number;
  afterConfidence: number;
  notes?: string;
  orgId: string;
}

export interface ListInterventionFilters {
  status?: string;
  type?: string;
  competencyId?: string;
  orgId: string;
}

export class InterventionService {
  constructor(
    private readonly interventionRepo: InterventionRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly outcomeRepo: OutcomeRepository
  ) {}

  async createIntervention(data: CreateInterventionData, userId: string): Promise<Result<Intervention>> {
    if (!data.title || data.title.trim().length === 0) {
      return err(new ValidationError('Title is required'));
    }
    if (!data.startDate || !data.endDate) {
      return err(new ValidationError('Start date and end date are required'));
    }
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      return err(new ValidationError('End date must be after start date'));
    }
    if (!data.capacity || data.capacity <= 0) {
      return err(new ValidationError('Capacity must be a positive number'));
    }
    if (!data.competencyIds || data.competencyIds.length === 0) {
      return err(new ValidationError('At least one competency is required'));
    }

    const intervention = new Intervention({
      id: EntityId.create(),
      title: data.title,
      description: data.description,
      type: data.type as any,
      competencyIds: data.competencyIds,
      competencyTargets: data.competencyTargets || [],
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      capacity: data.capacity,
      enrolledCount: 0,
      status: 'draft',
      createdBy: userId,
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.interventionRepo.save(intervention);
    return ok(intervention);
  }

  async getById(id: string): Promise<Result<Intervention>> {
    const intervention = await this.interventionRepo.findInterventionById(id);
    if (!intervention) {
      return err(new NotFoundError('Intervention', id));
    }
    return ok(intervention);
  }

  async publishIntervention(id: string): Promise<Result<Intervention>> {
    const intervention = await this.interventionRepo.findInterventionById(id);
    if (!intervention) {
      return err(new NotFoundError('Intervention', id));
    }

    const result = intervention.publish();
    if (!result.success) {
      return result;
    }

    await this.interventionRepo.save(intervention);
    return ok(intervention);
  }

  async completeIntervention(id: string): Promise<Result<Intervention>> {
    const intervention = await this.interventionRepo.findInterventionById(id);
    if (!intervention) {
      return err(new NotFoundError('Intervention', id));
    }

    const result = intervention.complete();
    if (!result.success) {
      return result;
    }

    await this.interventionRepo.save(intervention);
    return ok(intervention);
  }

  async cancelIntervention(id: string): Promise<Result<Intervention>> {
    const intervention = await this.interventionRepo.findInterventionById(id);
    if (!intervention) {
      return err(new NotFoundError('Intervention', id));
    }

    const result = intervention.cancel();
    if (!result.success) {
      return result;
    }

    await this.interventionRepo.save(intervention);
    return ok(intervention);
  }

  async listInterventions(filters: ListInterventionFilters): Promise<Result<Intervention[]>> {
    const interventions = await this.interventionRepo.findByOrg(filters.orgId, {
      status: filters.status,
      type: filters.type,
    });

    if (filters.competencyId) {
      const filtered = interventions.filter((i) =>
        i.competencyIds.includes(filters.competencyId!)
      );
      return ok(filtered);
    }

    return ok(interventions);
  }

  async enrollStudent(interventionId: string, studentId: string): Promise<Result<Enrollment>> {
    const intervention = await this.interventionRepo.findInterventionById(interventionId);
    if (!intervention) {
      return err(new NotFoundError('Intervention', interventionId));
    }

    if (intervention.status !== 'active') {
      return err(new ConflictError('Cannot enroll in an intervention that is not active'));
    }

    if (intervention.isFull) {
      return err(new ConflictError('Intervention is at full capacity'));
    }

    const existing = await this.enrollmentRepo.findByInterventionAndStudent(interventionId, studentId);
    if (existing) {
      return err(new ConflictError('Student is already enrolled in this intervention'));
    }

    const enrollment = new Enrollment({
      id: EntityId.create(),
      interventionId,
      studentId,
      status: 'enrolled',
      enrolledAt: new Date(),
      orgId: intervention.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    intervention.incrementEnrollment();
    await this.enrollmentRepo.save(enrollment);
    await this.interventionRepo.save(intervention);

    return ok(enrollment);
  }

  async updateEnrollmentStatus(
    enrollmentId: string,
    data: UpdateEnrollmentStatusData
  ): Promise<Result<Enrollment>> {
    const enrollment = await this.enrollmentRepo.findByIdPublic(enrollmentId);
    if (!enrollment) {
      return err(new NotFoundError('Enrollment', enrollmentId));
    }

    const entity = await this.enrollmentRepo.findByInterventionAndStudent(
      enrollment.interventionId,
      enrollment.studentId
    );
    if (!entity) {
      return err(new NotFoundError('Enrollment', enrollmentId));
    }

    if (data.notes) {
      entity.updateNotes(data.notes);
    }

    const result = entity.transitionTo(data.status);
    if (!result.success) {
      return result;
    }

    if (data.status === 'dropped' || data.status === 'no_show') {
      const intervention = await this.interventionRepo.findInterventionById(entity.interventionId);
      if (intervention) {
        intervention.decrementEnrollment();
        await this.interventionRepo.save(intervention);
      }
    }

    await this.enrollmentRepo.save(entity);
    return ok(entity);
  }

  async recordOutcome(data: RecordOutcomeData): Promise<Result<Outcome>> {
    if (data.beforeLevel < 0 || data.beforeLevel > 100) {
      return err(new ValidationError('beforeLevel must be between 0 and 100'));
    }
    if (data.afterLevel < 0 || data.afterLevel > 100) {
      return err(new ValidationError('afterLevel must be between 0 and 100'));
    }
    if (data.beforeConfidence < 0 || data.beforeConfidence > 100) {
      return err(new ValidationError('beforeConfidence must be between 0 and 100'));
    }
    if (data.afterConfidence < 0 || data.afterConfidence > 100) {
      return err(new ValidationError('afterConfidence must be between 0 and 100'));
    }

    const intervention = await this.interventionRepo.findInterventionById(data.interventionId);
    if (!intervention) {
      return err(new NotFoundError('Intervention', data.interventionId));
    }

    const outcome = new Outcome({
      id: EntityId.create(),
      interventionId: data.interventionId,
      studentId: data.studentId,
      competencyId: data.competencyId,
      beforeLevel: data.beforeLevel,
      afterLevel: data.afterLevel,
      beforeConfidence: data.beforeConfidence,
      afterConfidence: data.afterConfidence,
      measuredAt: new Date(),
      notes: data.notes,
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.outcomeRepo.save(outcome);
    return ok(outcome);
  }

  async getOutcomes(interventionId: string): Promise<Result<Outcome[]>> {
    const intervention = await this.interventionRepo.findInterventionById(interventionId);
    if (!intervention) {
      return err(new NotFoundError('Intervention', interventionId));
    }

    const outcomes = await this.outcomeRepo.findByIntervention(interventionId);
    return ok(outcomes);
  }

  async getEnrollments(interventionId: string): Promise<Result<Enrollment[]>> {
    const intervention = await this.interventionRepo.findInterventionById(interventionId);
    if (!intervention) {
      return err(new NotFoundError('Intervention', interventionId));
    }

    const enrollments = await this.enrollmentRepo.findByIntervention(interventionId);
    return ok(enrollments);
  }
}
