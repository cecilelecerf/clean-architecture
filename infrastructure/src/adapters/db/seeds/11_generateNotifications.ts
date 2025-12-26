import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { SeedNotificationUseCase } from "@application/usecases/seeds/SeedNotificationUseCase";
import { pick, rand } from "./utils";
import { ClockService } from "@application/ports/services/ClockService";
import { rawNotifications } from "./raw/notifications";

export async function generateNotifications(
  advisors: UserEntity[],
  clients: UserEntity[],
  seedNotificationUseCase: SeedNotificationUseCase,
  clockService: ClockService
): Promise<NotificationEntity[]> {
  console.log("-- Création des Notifications --");

  if (!advisors.length || !clients.length) {
    throw new Error("Tu dois fournir au moins un advisor et un client.");
  }

  const notifications: NotificationEntity[] = [];

  for (const raw of rawNotifications) {
    try {
      const advisor = pick(advisors);
      const client = pick(clients);
      const createdAt = clockService.now();

      const notification = await seedNotificationUseCase.execute({
        advisorId: advisor.id,
        clientId: client.id,
        title: raw.title,
        content: raw.content,
        type: raw.type as "info" | "alert" | "reminder",
        isRead: false,
        createdAt,
        updatedAt:
          Math.random() < 0.3
            ? clockService.addDays(createdAt, rand(1, 10))
            : clockService.nowMinusDays(rand(0, 60)),
      });

      notifications.push(notification);
      console.log(
        `  ✅ Notification created: ${notification.type.toUpperCase()} - ${
          notification.title
        } (${notification.id})`
      );
    } catch (err) {
      console.warn(`  ⚠️  Failed to create notification:`, err);
    }
  }

  console.log(
    `✅ Notifications seed completed: ${notifications.length} created\n`
  );
  return notifications;
}
