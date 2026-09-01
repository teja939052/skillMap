import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import type { Notification } from '../types/index.js';

export const NotificationService = {
  async create(data: { userId: string; type: string; title: string; message: string; data?: Record<string, unknown> }) {
    const collection = getCollection<Notification>('notifications');
    const notification: Notification = {
      _id: new ObjectId(),
      userId: new ObjectId(data.userId),
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      read: false,
      createdAt: new Date(),
    };
    await collection.insertOne(notification);
    return { id: notification._id.toString(), title: notification.title };
  },

  async list(userId: string, page: number, limit: number, unreadOnly = false) {
    const collection = getCollection<Notification>('notifications');
    const filter: Record<string, unknown> = { userId: new ObjectId(userId) };
    if (unreadOnly) filter.read = false;

    const total = await collection.countDocuments(filter);
    const items = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      items: items.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        read: n.read,
        createdAt: n.createdAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async markAsRead(notificationId: string, userId: string) {
    const collection = getCollection<Notification>('notifications');
    await collection.updateOne(
      { _id: new ObjectId(notificationId), userId: new ObjectId(userId) },
      { $set: { read: true } }
    );
  },

  async markAllAsRead(userId: string) {
    const collection = getCollection<Notification>('notifications');
    await collection.updateMany(
      { userId: new ObjectId(userId), read: false },
      { $set: { read: true } }
    );
  },

  async getUnreadCount(userId: string) {
    const collection = getCollection<Notification>('notifications');
    return collection.countDocuments({ userId: new ObjectId(userId), read: false });
  },
};
