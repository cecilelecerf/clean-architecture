import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserMapper } from "../../mappers/UserMapper";
import { getUserFields } from "../constants/userField";

export class MessageRepositoryMySQL implements MessageRepository {
  constructor(private readonly client: MySQLClient) {}
  private mapRowToMessage(
    row: RowDataPacket,
    prefix: string = "",
  ): MessageEntity {
    const readerIds = row.reader_ids
      ? row.reader_ids.split(",").filter(Boolean)
      : [];

    const readBy =
      readerIds.length > 0
        ? [...new Set([row[`${prefix}sender_id`], ...readerIds])]
        : [row[`${prefix}sender_id`]];

    return MessageEntity.from({
      id: row[`${prefix}id`],
      threadId: row[`${prefix}thread_id`],
      senderId: row[`${prefix}sender_id`],
      content: row[`${prefix}content`],
      sentAt: new Date(row[`${prefix}sent_at`]),
      readBy: readBy,
    });
  }
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
      ],
    );

    // Marquer le message comme lu par l'expéditeur
    await this.client.query<ResultSetHeader>(
      `INSERT INTO message_user_read (message_id, user_id, read_at)
       VALUES (?, ?, ?)`,
      [message.id, message.senderId, message.sentAt],
    );
  }

  /** Messages avec sender par thread */
  async findAllWithUserByThread(
    threadId: ThreadEntity["id"],
  ): Promise<MessageWithUser[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        m.id AS message_id,
        m.thread_id AS message_thread_id,
        m.sender_id AS message_sender_id,
        m.content AS message_content,
        m.sent_at AS message_sent_at,
        ${getUserFields("u", "user_")},
        ${getUserFields("reader", "reader_")},
      mur.read_at AS reader_read_at
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN message_user_read mur ON m.id = mur.message_id
       LEFT JOIN users reader ON mur.user_id = reader.id
       WHERE m.thread_id = ? 
       ORDER BY m.sent_at ASC, reader.id ASC`,
      [threadId],
    );

    const messagesMap = new Map<
      MessageEntity["id"],
      {
        message: MessageEntity;
        sender: UserEntity;
        readers: MessageWithUser["readByUsers"];
      }
    >();

    rows.forEach((row) => {
      const messageId = row.message_id;

      if (!messagesMap.has(messageId)) {
        const message = this.mapRowToMessage(row, "message_");
        const sender = UserMapper.mapRowToUser(row, "user_");

        messagesMap.set(messageId, {
          message,
          sender,
          readers: [],
        });
      }

      if (row.reader_id) {
        messagesMap.get(messageId)!.readers.push({
          user: UserMapper.mapRowToUser(row, "reader_"),
          readAt: new Date(row.reader_read_at),
        });
      }
    });

    const result: MessageWithUser[] = Array.from(messagesMap.values()).map(
      ({ message, sender, readers }) =>
        Object.assign(message, { sender, readByUsers: readers }),
    );

    return result;
  }

  async findById(id: MessageEntity["id"]): Promise<MessageEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
          m.id,
          m.thread_id,
          m.sender_id,
          m.content,
          m.sent_at, 
          GROUP_CONCAT(DISTINCT mur.user_id) as reader_ids
         FROM messages m
         LEFT JOIN message_user_read mur ON m.id = mur.message_id 
         WHERE m.id = ?
         GROUP BY m.id, m.thread_id, m.sender_id, m.content, m.sent_at, m.created_at`,
      [id],
    );

    if (!rows.length) return null;

    return this.mapRowToMessage(rows[0]);
  }

  async findUnreadUpTo(
    threadId: string,
    userId: string,
    sentAt: Date,
  ): Promise<MessageEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
          m.id,
          m.thread_id,
          m.sender_id,
          m.content,
          m.sent_at,
          GROUP_CONCAT(DISTINCT mur.user_id) as reader_ids
         FROM messages m
         LEFT JOIN message_user_read mur ON m.id = mur.message_id
         WHERE m.thread_id = ?
           AND m.sent_at <= ?
           AND m.sender_id != ?
           AND NOT EXISTS (
             SELECT 1 FROM message_user_read mur2 
             WHERE mur2.message_id = m.id AND mur2.user_id = ?
           )
         GROUP BY m.id
         ORDER BY m.sent_at ASC`,
      [threadId, sentAt, userId, userId],
    );

    return rows.map((row) => this.mapRowToMessage(row));
  }

  async updateMany(messages: MessageEntity[], now: Date): Promise<void> {
    if (messages.length === 0) return;

    for (const message of messages) {
      const existing = await this.client.query<RowDataPacket[]>(
        `SELECT user_id FROM message_user_read WHERE message_id = ?`,
        [message.id],
      );

      const existingReaders = existing.map((r: any) => r.user_id);
      const newReaders = message.readBy.filter(
        (userId) => !existingReaders.includes(userId),
      );

      if (newReaders.length > 0) {
        const values = newReaders.map(() => "(?, ?, ?)").join(",");
        const params = newReaders.flatMap((userId) => [
          message.id,
          userId,
          now,
        ]);

        await this.client.query<ResultSetHeader>(
          `INSERT INTO message_user_read (message_id, user_id, read_at) 
             VALUES ${values}`,
          params,
        );
      }
    }
  }
}
