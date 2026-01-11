import { NotificationEntity } from "@domain/entities/NotificationEntity";

export interface NotificationRepository {
  save(notification: NotificationEntity): Promise<void>;
}
