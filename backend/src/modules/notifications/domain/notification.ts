import { EntityId } from '../../../shared/domain/entity.js';

export interface NotificationProps {
  id: EntityId;
  userId: string;
  title: string;
  body: string;
  type: 'opportunity_match' | 'freelance_match' | 'application_update' | 'system';
  link?: string;
  read: boolean;
  createdAt: Date;
}

export class AppNotification {
  readonly id: EntityId;
  readonly userId: string;
  readonly title: string;
  readonly body: string;
  readonly type: NotificationProps['type'];
  readonly link?: string;
  read: boolean;
  readonly createdAt: Date;

  constructor(props: NotificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.body = props.body;
    this.type = props.type;
    this.link = props.link;
    this.read = props.read;
    this.createdAt = props.createdAt;
  }

  markRead(): void {
    this.read = true;
  }
}
