import { MySQLClient } from "@adapters/db/MySQLClient";
import { MessageRepository } from "@application/ports/repositories/MessageRepository";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class MessageRepositoryMySQL implements MessageRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(message: MessageEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO messages (id, threadId, senderId, content, sentAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.threadId,
        message.senderId,
        message.content,
        message.sentAt,
      ]
    );

    await this.client.query<ResultSetHeader>(
      `INSERT INTO message_user_read (messageId, userId, readAt)
       VALUES (?, ?, ?)`,
      [message.id, message.senderId, message.sentAt]
    );
  }

  async findAllByThread(
    threadId: ThreadEntity["id"]
  ): Promise<MessageEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM messages WHERE threadId = ? ORDER BY sentAt ASC`,
      [threadId]
    );

    return rows.map((row) =>
      MessageEntity.from({
        id: row.id,
        threadId: row.threadId,
        senderId: row.senderId,
        content: row.content,
        sentAt: row.sentAt,
        readBy: JSON.parse(row.readBy || "[]"), // On parse le JSON pour récupérer l'array
      })
    );
  }

  async update(message: MessageEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE messages SET content = ? WHERE id = ?`,
      [message.content, message.id]
    );

    const existingUserReadRows = await this.client.query<RowDataPacket[]>(
      `SELECT userId FROM message_user_read WHERE messageId = ?`,
      [message.id]
    );
    const existingUserReadIds = existingUserReadRows.map((r) => r.userId);

    const UsersReadToAdd = message.readBy.filter(
      (id) => !existingUserReadIds.includes(id)
    );
    for (const userId of UsersReadToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO message_user_read (messageId, userId) VALUES (?, ?)`,
        [message.id, userId]
      );
    }

    const UsersReadToRemove = existingUserReadIds.filter(
      (id) => !message.readBy.includes(id)
    );
    for (const userId of UsersReadToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM message_user_read WHERE messageId = ? AND userId = ?`,
        [message.id, userId]
      );
    }
  }

  async delete(messageId: MessageEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM messages WHERE id = ?`,
      [messageId]
    );
  }
}
