import { NotificationRepository } from "@application/ports/repositories/NotificationRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { NotificationEntity } from "@domain/entities/NotificationEntity";

export interface SeedNotificationRequest {
  advisorId: string;
  clientId: string;
  title: string;
  content: string;
  type: "info" | "alert" | "reminder";
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedNotificationUseCase {
  constructor(
    private notificationRepository: NotificationRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedNotificationRequest): Promise<NotificationEntity> {
    const now = this.clockService.now();

    const notification = NotificationEntity.from({
      id: this.uuidService.generate(),
      advisorId: request.advisorId,
      clientId: request.clientId,
      title: request.title,
      content: request.content,
      type: request.type,
      isRead: request.isRead ?? false,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.notificationRepository.save(notification);
    return notification;
  }
}
