import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class MessageRepositoryMySQL implements MessageRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(message: MessageEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO messages (id, thread_id, sender_id, content, sent_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        message.id,
        message.threadId,
        message.senderId,
        message.content,
        message.sentAt,
      ]
    );

    await this.client.query<ResultSetHeader>(
      `INSERT INTO message_user_read (message_id, user_id, read_at)
       VALUES (?, ?, ?)`,
      [message.id, message.senderId, message.sentAt]
    );
  }

  async findAllByThread(
    threadId: ThreadEntity["id"]
  ): Promise<MessageEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT *
      FROM messages
      WHERE messages.thread_id = ?
      ORDER BY messages.sent_at ASC
      `,
      [threadId]
    );

    return rows.map((row) =>
      MessageEntity.from({
        id: row.id,
        threadId: row.thread_id,
        senderId: row.sender_id,
        content: row.content,
        sentAt: new Date(row.sent_at),
        readBy: JSON.parse(row.read_by || "[]"),
      })
    );
  }

  async update(message: MessageEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE messages SET content = ? WHERE id = ?`,
      [message.content, message.id]
    );

    const existingUserReadRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM message_user_read WHERE message_id = ?`,
      [message.id]
    );
    const existingUserReadIds = existingUserReadRows.map((r) => r.userId);

    const UsersReadToAdd = message.readBy.filter(
      (id) => !existingUserReadIds.includes(id)
    );
    for (const userId of UsersReadToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO message_user_read (message_id, user_id) VALUES (?, ?)`,
        [message.id, userId]
      );
    }

    const UsersReadToRemove = existingUserReadIds.filter(
      (id) => !message.readBy.includes(id)
    );
    for (const userId of UsersReadToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM message_user_read WHERE message_id = ? AND user_id = ?`,
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
