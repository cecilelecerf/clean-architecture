import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { NotificationRepository } from "@application/ports/repositories/NotificationRepository";
import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class NotificationRepositoryMySQL implements NotificationRepository {
  constructor(private readonly client: MySQLClient) {}

  /** Sauvegarder une notification */
  async save(notification: NotificationEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO notifications 
       (id, advisor_id, client_id, title, content, is_read, type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notification.id,
        notification.advisorId,
        notification.clientId,
        notification.title,
        notification.content,
        notification.isRead ? 1 : 0,
        notification.type,
        notification.createdAt,
        notification.updatedAt,
      ]
    );
  }
}
