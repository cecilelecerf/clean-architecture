import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { NotificationRepositoryMySQL } from "../repositories/NotificationRepositoryMySQL";
import { rawNotifications } from "../../seeds/notifications";
import { UserEntity } from "@domain/entities/UserEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { pick, rand } from "./utils";

export async function generateNotifications(
  mysqlClient: MySQLClient,
  advisors: UserEntity[],
  clients: UserEntity[],
): Promise<NotificationEntity[]> {
    console.log("-- Création des Notifications --");

    const notificationRepository = new NotificationRepositoryMySQL(mysqlClient);
    const uuidService = new NodeUuidService();
    const clockService = new SystemClockService();

    const notifications = [];
    for (const raw of rawNotifications) {
        try {
            const advisor = pick(advisors);
            const client = pick(clients);
                            const createdAt =  clockService.now()

            const notification = NotificationEntity.from({
                id: uuidService.generate(),
                advisorId: advisor.id,
                clientId: client.id,
                title: raw.title,
                content: raw.content,
                isRead: false,
                type: raw.type as "info" | "alert" | "reminder",
                createdAt,
                                updatedAt:   Math.random() < 0.3
                                        ? clockService.addDays(createdAt, rand(1, 10))
                                        :  clockService.nowMinusDays(rand(0, 60))
            });
                        

            notifications.push(notification);
            await notificationRepository.save(notification);
            console.log(notification.id);

        } catch (err) {
            console.error("Error creating notifications from raw", raw, err);
        }
    }
    return notifications;
}