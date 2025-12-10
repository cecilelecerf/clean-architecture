import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { NotificationRepository } from "@application/ports/repositories/NotificationRepository";
import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class NotificationRepositoryMySQL implements NotificationRepository {
  constructor(private readonly client: MySQLClient) {}

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
        notification.updatedAt ?? null
      ]
    );
  }

  async findById(
    id: NotificationEntity["id"]
  ): Promise<NotificationEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return NotificationEntity.from({
      id: row.id,
      advisorId: row.advisorId,
      clientId: row.clientId,
      title: row.title,
      content: row.content,
      isRead: !!row.isRead,
      type: row.type,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null
    });
  }

  async findAllByClientId(
    clientId: NotificationEntity["clientId"]
  ): Promise<NotificationEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC`,
      [clientId]
    );
    return rows.map((row) =>
      NotificationEntity.from({
        id: row.id,
        advisorId: row.advisorId,
        clientId: row.clientId,
        title: row.title,
        content: row.content,
        isRead: !!row.isRead,
        type: row.type,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null
      })
    );
  }

  async findAllByAdvisorId(
    advisorId: NotificationEntity["advisorId"]
  ): Promise<NotificationEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE advisor_id = ? ORDER BY created_at DESC`,
      [advisorId]
    );
    return rows.map((row) =>
      NotificationEntity.from({
        id: row.id,
        advisorId: row.advisorId,
        clientId: row.clientId,
        title: row.title,
        content: row.content,
        isRead: !!row.isRead,
        type: row.type,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null
      })
    );
  }

  async findRecentByClientId(
    clientId: NotificationEntity["clientId"],
    limit: number = 10
  ): Promise<NotificationEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC LIMIT ?`,
      [clientId, limit]
    );
    return rows.map((row) =>
      NotificationEntity.from({
        id: row.id,
        advisorId: row.advisorId,
        clientId: row.clientId,
        title: row.title,
        content: row.content,
        isRead: !!row.isRead,
        type: row.type,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null
      })
    );
  }

  async update(notification: NotificationEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE notifications 
       SET title = ?, content = ?, isRead = ?, type = ?, updatedAt = ?
       WHERE id = ?`,
      [
        notification.title,
        notification.content,
        notification.isRead ? 1 : 0,
        notification.type,
        notification.id,
        notification.updatedAt || new Date()
      ]
    );
  }

  async delete(id: NotificationEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM notifications WHERE id = ?`,
      [id]
    );
  }
}
