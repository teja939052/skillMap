import { Collection, ObjectId, Filter, FindOptions, OptionalId, Document } from 'mongodb';
import { getCollection, PaginationParams, PaginatedResult, paginatedQuery } from './database.js';
import { DomainEvent } from '../domain/entity.js';
import { Outbox } from '../events/types.js';

export interface BaseDocument {
  _id: string | ObjectId;
  orgId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
  status: string;
  deletedAt?: Date | null;
}

export class OutboxRepository implements Outbox {
  private get collection() {
    return getCollection<any>('outbox');
  }

  async store(event: DomainEvent): Promise<void> {
    const record = { id: event.eventId, event, published: false, attempts: 0, createdAt: new Date() };
    await this.collection.insertOne(record);
  }

  async getUnpublished(batchSize = 100): Promise<any[]> {
    return this.collection.find({ published: false }).sort({ createdAt: 1 }).limit(batchSize).toArray();
  }

  async markPublished(id: string): Promise<void> {
    await this.collection.updateOne({ _id: id }, { $set: { published: true, publishedAt: new Date() } });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.collection.updateOne({ _id: id }, { $set: { error }, $inc: { attempts: 1 } });
  }
}

export abstract class Repository<T extends Document = any> {
  protected abstract collectionName: string;
  protected softDelete: boolean = true;

  protected get collection(): Collection<T> {
    return getCollection<T>(this.collectionName);
  }

  protected async findById(id: string): Promise<T | null> {
    const filter: Filter<T> = { _id: id } as Filter<T>;
    if (this.softDelete) (filter as any).deletedAt = null;
    return this.collection.findOne(filter) as Promise<T | null>;
  }

  public async findByIdPublic(id: string): Promise<T | null> {
    return this.findById(id);
  }

  protected async findOne(filter: Filter<T>): Promise<T | null> {
    const finalFilter = this.softDelete ? { ...filter, deletedAt: null } : filter;
    return this.collection.findOne(finalFilter) as Promise<T | null>;
  }

  public async findOnePublic(filter: Filter<T>): Promise<T | null> {
    return this.findOne(filter);
  }

  protected async find(filter: Filter<T>, options?: FindOptions): Promise<T[]> {
    const finalFilter = this.softDelete ? { ...filter, deletedAt: null } : filter;
    return this.collection.find(finalFilter, options).toArray() as Promise<T[]>;
  }

  public async findPublic(filter: Filter<T>, options?: FindOptions): Promise<T[]> {
    return this.find(filter, options);
  }

  protected async insert(document: OptionalId<T>): Promise<T> {
    const result = await this.collection.insertOne(document as any);
    return { ...document, _id: result.insertedId } as T;
  }

  protected async update(id: string, updates: Partial<T>, actorId?: string): Promise<T | null> {
    const filter: Filter<T> = { _id: id } as Filter<T>;
    if (this.softDelete) (filter as any).deletedAt = null;
    const update: Record<string, unknown> = { $set: { ...updates, updatedAt: new Date() }, $inc: { version: 1 } };
    if (actorId) (update.$set as Record<string, unknown>).updatedBy = actorId;
    const result = await this.collection.findOneAndUpdate(filter, update as any, { returnDocument: 'after' });
    return result as T | null;
  }

  protected async softDeleteById(id: string): Promise<boolean> {
    const result = await this.collection.updateOne({ _id: id } as Filter<T>, { $set: { deletedAt: new Date(), updatedAt: new Date() } as any });
    return result.modifiedCount > 0;
  }

  protected async count(filter: Filter<T>): Promise<number> {
    const finalFilter = this.softDelete ? { ...filter, deletedAt: null } : filter;
    return this.collection.countDocuments(finalFilter);
  }
}
