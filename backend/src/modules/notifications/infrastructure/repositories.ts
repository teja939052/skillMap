import { Repository } from '../../../shared/persistence/repository.js';
import { AppNotification } from '../domain/notification.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface NotificationDocument {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  deletedAt?: Date | null;
}

export class NotificationRepository extends Repository<NotificationDocument> {
  protected collectionName = 'notifications';

  async findNotificationById(id: string): Promise<AppNotification | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUser(userId: string, options?: { limit?: number; unreadOnly?: boolean }): Promise<AppNotification[]> {
    const filter: any = { userId };
    if (options?.unreadOnly) filter.read = false;
    const docs = await this.find(filter, { sort: { createdAt: -1 }, limit: options?.limit || 50 });
    return docs.map((d) => this.toEntity(d));
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({ userId, read: false });
  }

  async save(notification: AppNotification): Promise<void> {
    const doc = this.toDocument(notification);
    await this.collection.updateOne(
      { _id: notification.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await this.collection.updateMany({ userId, read: false } as any, { $set: { read: true, updatedAt: new Date() } });
  }

  private toEntity(d: NotificationDocument): AppNotification {
    return new AppNotification({
      id: EntityId.fromString(d._id.toString()),
      userId: d.userId,
      title: d.title,
      body: d.body,
      type: d.type as any,
      link: d.link,
      read: d.read,
      createdAt: d.createdAt,
    });
  }

  private toDocument(n: AppNotification): NotificationDocument {
    return {
      _id: n.id.toString(),
      userId: n.userId,
      title: n.title,
      body: n.body,
      type: n.type,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
      deletedAt: null,
    };
  }
}
