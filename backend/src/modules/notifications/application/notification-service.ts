import { AppNotification } from '../domain/notification.js';
import { NotificationRepository } from '../infrastructure/repositories.js';
import { EntityId } from '../../../shared/domain/entity.js';

export class NotificationService {
  constructor(
    private readonly repo: NotificationRepository
  ) {}

  async listForUser(userId: string, options: { limit?: number; unreadOnly?: boolean } = {}) {
    const items = await this.repo.findByUser(userId, options);
    const unread = await this.repo.countUnread(userId);
    return { items: items.map((n) => this.serialize(n)), unread };
  }

  async markRead(notificationId: string) {
    const n = await this.repo.findNotificationById(notificationId);
    if (!n) return { success: false };
    n.markRead();
    await this.repo.save(n);
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.repo.markAllRead(userId);
    return { success: true };
  }

  async pushForUser(userId: string, input: { title: string; body: string; type: string; link?: string }) {
    const n = new AppNotification({
      id: EntityId.create(),
      userId,
      title: input.title,
      body: input.body,
      type: input.type as any,
      link: input.link,
      read: false,
      createdAt: new Date(),
    });
    await this.repo.save(n);
    return n;
  }

  async pushMany(userIds: string[], input: { title: string; body: string; type: string; link?: string }) {
    for (const userId of userIds) {
      await this.pushForUser(userId, input);
    }
  }

  private serialize(n: AppNotification) {
    return {
      id: n.id.toString(),
      title: n.title,
      body: n.body,
      type: n.type,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
    };
  }
}
