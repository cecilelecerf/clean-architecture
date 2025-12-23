import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { UserMapper } from "../../mappers/UserMapper";

export class MessageRepositoryMySQL implements MessageRepository {
  constructor(private readonly client: MySQLClient) {}

  private async updateMessageReaders(
    messageId: string,
    newReaderIds: string[]
  ): Promise<void> {
    const existingRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM message_user_read WHERE message_id = ?`,
      [messageId]
    );
    const existingIds = existingRows.map((r) => r.user_id);

    const idsToAdd = newReaderIds.filter((id) => !existingIds.includes(id));
    for (const userId of idsToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO message_user_read (message_id, user_id, read_at) VALUES (?, ?, NOW())`,
        [messageId, userId]
      );
    }

    const idsToRemove = existingIds.filter((id) => !newReaderIds.includes(id));
    for (const userId of idsToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM message_user_read WHERE message_id = ? AND user_id = ?`,
        [messageId, userId]
      );
    }
  }

  /** Sauvegarder un message */
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

    // Marquer le message comme lu par l'expéditeur
    await this.client.query<ResultSetHeader>(
      `INSERT INTO message_user_read (message_id, user_id, read_at)
       VALUES (?, ?, ?)`,
      [message.id, message.senderId, message.sentAt]
    );
  }

  /** Tous les messages d'un thread */
  async findAllByThread(
    threadId: ThreadEntity["id"]
  ): Promise<MessageEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        m.*,
        GROUP_CONCAT(mur.user_id) as reader_ids
       FROM messages m
       LEFT JOIN message_user_read mur ON m.id = mur.message_id
       WHERE m.thread_id = ?
       GROUP BY m.id
       ORDER BY m.sent_at ASC`,
      [threadId]
    );

    return rows.map((row) => {
      const readerIds = row.reader_ids ? row.reader_ids.split(",") : [];
      return MessageEntity.from({
        id: row.id,
        threadId: row.thread_id,
        senderId: row.sender_id,
        content: row.content,
        sentAt: new Date(row.sent_at),
        readBy: readerIds,
      });
    });
  }

  /** Mettre à jour un message */
  async update(message: MessageEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE messages SET content = ? WHERE id = ?`,
      [message.content, message.id]
    );

    await this.updateMessageReaders(message.id, message.readBy);
  }

  /** Supprimer un message */
  async delete(messageId: MessageEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM messages WHERE id = ?`,
      [messageId]
    );
  }

  /** Messages avec sender par thread */
  async findAllWithUserByThread(
    threadId: ThreadEntity["id"]
  ): Promise<MessageWithUser[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        m.id AS message_id,
        m.thread_id,
        m.sender_id,
        m.content,
        m.sent_at,
        GROUP_CONCAT(mur.user_id) as reader_ids,
        u.id AS user_id,
        u.firstname,
        u.lastname,
        u.email,
        u.password_hash,
        u.role,
        u.is_active,
        u.created_at AS user_created_at,
        u.confirmed_at,
        u.updated_at AS user_updated_at
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN message_user_read mur ON m.id = mur.message_id
       WHERE m.thread_id = ?
       GROUP BY m.id, u.id
       ORDER BY m.sent_at ASC`,
      [threadId]
    );
    const result: MessageWithUser[] = rows.map((row): MessageWithUser => {
      const readerIds = row.reader_ids ? row.reader_ids.split(",") : [];
      const message = MessageEntity.from({
        id: row.message_id,
        threadId: row.thread_id,
        senderId: row.sender_id,
        content: row.content,
        sentAt: new Date(row.sent_at),
        readBy: readerIds,
      });
      const sender: UserEntity = UserMapper.mapRowToUser(row);
      return Object.assign(message, { sender });
    });
    console.log(result);
    return result;
  }
}
