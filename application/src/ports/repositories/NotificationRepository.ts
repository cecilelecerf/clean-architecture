import { NotificationEntity } from "@domain/entities/NotificationEntity";

export interface NotificationRepository {
  save(notification: NotificationEntity): Promise<void>;
  findById(id: NotificationEntity["id"]): Promise<NotificationEntity | null>;
  findAllByClientId(
    clientId: NotificationEntity["clientId"]
  ): Promise<NotificationEntity[]>;
  findAllByAdvisorId(
    advisorId: NotificationEntity["advisorId"]
  ): Promise<NotificationEntity[]>;
  findRecentByClientId(
    clientId: NotificationEntity["clientId"],
    limit?: number
  ): Promise<NotificationEntity[]>;
  update(notification: NotificationEntity): Promise<void>;
  delete(id: NotificationEntity["id"]): Promise<void>;
}
