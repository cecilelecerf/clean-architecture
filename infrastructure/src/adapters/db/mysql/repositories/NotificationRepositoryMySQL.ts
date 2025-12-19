import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { NotificationRepository } from "@application/ports/repositories/NotificationRepository";
import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class NotificationRepositoryMySQL implements NotificationRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToNotification(row: RowDataPacket): NotificationEntity {
    return NotificationEntity.from({
      id: row.id,
      advisorId: row.advisor_id,
      clientId: row.client_id,
      title: row.title,
      content: row.content,
      isRead: !!row.is_read,
      type: row.type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /** Sauvegarder une notification */
  async save(notification: NotificationEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO notifications 
       (id, advisor_id, client_id, title, content, is_read, type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notification.id,
        notification.advisorId,
        notification.clientId,
        notification.title,
        notification.content,
        notification.isRead ? 1 : 0,
        notification.type,
        notification.createdAt,
      ]
    );
  }

  /** Trouver une notification par ID */
  async findById(
    id: NotificationEntity["id"]
  ): Promise<NotificationEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRowToNotification(rows[0]);
  }

  /** Toutes les notifications d'un client */
  async findAllByClientId(
    clientId: NotificationEntity["clientId"]
  ): Promise<NotificationEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC`,
      [clientId]
    );

    return rows.map((row) => this.mapRowToNotification(row));
  }

  /** Toutes les notifications d'un conseiller */
  async findAllByAdvisorId(
    advisorId: NotificationEntity["advisorId"]
  ): Promise<NotificationEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE advisor_id = ? ORDER BY created_at DESC`,
      [advisorId]
    );

    return rows.map((row) => this.mapRowToNotification(row));
  }

  /** Notifications récentes d'un client */
  async findRecentByClientId(
    clientId: NotificationEntity["clientId"],
    limit: number = 10
  ): Promise<NotificationEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC LIMIT ?`,
      [clientId, limit]
    );

    return rows.map((row) => this.mapRowToNotification(row));
  }

  /** Mettre à jour une notification */
  async update(notification: NotificationEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE notifications 
       SET title = ?, content = ?, is_read = ?, type = ?, updated_at = ?
       WHERE id = ?`,
      [
        notification.title,
        notification.content,
        notification.isRead ? 1 : 0,
        notification.type,
        notification.updatedAt || new Date(),
        notification.id,
      ]
    );
  }

  /** Supprimer une notification */
  async delete(id: NotificationEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM notifications WHERE id = ?`,
      [id]
    );
  }
}
