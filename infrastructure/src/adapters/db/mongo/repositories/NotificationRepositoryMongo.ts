import { NotificationRepository } from "@application/ports/repositories/NotificationRepository";
import { MongoClient } from "../../MongoClient";
import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { NotificationModel } from "../models/NotificationModel";

export class NotificationRepositoryMongo implements NotificationRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToNotification(doc: any): NotificationEntity {
    return NotificationEntity.from({
      id: doc._id.toString(),
      advisorId: doc.advisorId,
      clientId: doc.clientId,
      title: doc.title,
      content: doc.content,
      isRead: doc.isRead,
      type: doc.type,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** Sauvegarder une notification */
  async save(notification: NotificationEntity): Promise<void> {
    await this.client.connect();

    await NotificationModel.create({
      _id: notification.id,
      advisorId: notification.advisorId,
      clientId: notification.clientId,
      title: notification.title,
      content: notification.content,
      isRead: notification.isRead,
      type: notification.type,
      createdAt: notification.createdAt,
    });
  }

  /** Trouver une notification par ID */
  async findById(
    id: NotificationEntity["id"]
  ): Promise<NotificationEntity | null> {
    await this.client.connect();

    const doc = await NotificationModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToNotification(doc);
  }

  /** Toutes les notifications d'un client */
  async findAllByClientId(
    clientId: NotificationEntity["clientId"]
  ): Promise<NotificationEntity[]> {
    await this.client.connect();

    const docs = await NotificationModel.find({ clientId })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToNotification(doc));
  }

  /** Toutes les notifications d'un conseiller */
  async findAllByAdvisorId(
    advisorId: NotificationEntity["advisorId"]
  ): Promise<NotificationEntity[]> {
    await this.client.connect();

    const docs = await NotificationModel.find({ advisorId })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToNotification(doc));
  }

  /** Notifications récentes d'un client */
  async findRecentByClientId(
    clientId: NotificationEntity["clientId"],
    limit: number = 10
  ): Promise<NotificationEntity[]> {
    await this.client.connect();

    const docs = await NotificationModel.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map((doc) => this.mapDocToNotification(doc));
  }

  /** Mettre à jour une notification */
  async update(notification: NotificationEntity): Promise<void> {
    await this.client.connect();

    await NotificationModel.updateOne(
      { _id: notification.id },
      {
        $set: {
          advisorId: notification.advisorId,
          clientId: notification.clientId,
          title: notification.title,
          content: notification.content,
          isRead: notification.isRead,
          type: notification.type,
          updatedAt: notification.updatedAt || new Date(),
        },
      }
    );
  }

  /** Supprimer une notification */
  async delete(id: NotificationEntity["id"]): Promise<void> {
    await this.client.connect();

    await NotificationModel.deleteOne({ _id: id });
  }
}
