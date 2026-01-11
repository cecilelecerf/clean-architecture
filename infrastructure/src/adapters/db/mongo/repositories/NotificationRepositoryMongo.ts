import { NotificationRepository } from "@application/ports/repositories/NotificationRepository";
import { MongoClient } from "../../MongoClient";
import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { NotificationModel } from "../models/NotificationModel";

export class NotificationRepositoryMongo implements NotificationRepository {
  constructor(private readonly client: MongoClient) {}

  /** Sauvegarder une notification */
  async save(notification: NotificationEntity): Promise<void> {
    await this.client.connect();

    await NotificationModel.create({
      _id: notification.id,
      advisorId: notification.advisorId,
      clientId: notification.clientId,
      title: notification.title,
      content: notification.content,
      isRead: notification.isRead ?? false,
      type: notification.type,
      createdAt: notification.createdAt ?? new Date(),
      updatedAt: notification.updatedAt ?? notification.createdAt ?? new Date(),
    });
  }
}
