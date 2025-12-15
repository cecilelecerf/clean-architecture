import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { MongoClient } from "../../MongoClient";
import { NotificationRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/NotificationRepositoryMongo";
import { rawNotifications } from "../../seeds/notifications";
import { UserEntity } from "@domain/entities/UserEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { pick } from "./utils";

export async function generateNotificationsMongo(
  mongoClient: MongoClient,
  advisors: UserEntity[],
  clients: UserEntity[],
): Promise<NotificationEntity[]> {
  console.log("-- Création des Notifications (Mongo) --");

  await mongoClient.connect();

  const notificationRepository = new NotificationRepositoryMongo(mongoClient);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const notifications: NotificationEntity[] = [];

  for (const raw of rawNotifications) {
    try {
      const advisor = pick(advisors);
      const client = pick(clients);

      if (!advisor || !client) {
        console.warn("Advisor ou client manquant pour la notification");
        continue;
      }

      const notification = NotificationEntity.from({
        id: uuidService.generate(),
        advisorId: advisor.id,
        clientId: client.id,
        title: raw.title,
        content: raw.content,
        isRead: false,
        type: raw.type as "info" | "alert" | "reminder",
        createdAt: clockService.now(),
      });

      notifications.push(notification);
      await notificationRepository.save(notification);
      console.log(notification.id);
    } catch (err) {
      console.error("Error creating notification from raw", raw, err);
    }
  }

  return notifications;
}
