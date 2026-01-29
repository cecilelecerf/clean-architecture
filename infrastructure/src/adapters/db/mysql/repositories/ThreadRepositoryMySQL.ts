import {
  ThreadEntityWithUsers,
  ThreadEntityWithUsersAndLastMessage,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UserMapper } from "../../mappers/UserMapper";
import { MessageMapper } from "../../mappers/MessageMapper";
import { getNullUserFields, getUserFields } from "../constants/userField";
import { getMessageFields } from "../constants/messageField";

export class ThreadRepositoryMySQL implements ThreadRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowsToThreadsWithUsers(
    rows: RowDataPacket[],
  ): ThreadEntityWithUsers[] {
    const threadsMap = new Map<string, ThreadEntityWithUsers>();

    for (const row of rows) {
      if (!threadsMap.has(row.id)) {
        const thread = ThreadEntity.from({
          id: row.id,
          administratorId: row.administrator_id,
          participantsId: [],
          title: row.title,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          isClose: row.is_close === 1,
          type: row.type,
        }) as ThreadEntityWithUsers;

        thread.administrator = row.admin_id
          ? UserMapper.mapRowToUser(row, "admin_")
          : null;

        thread.participants = [];
        threadsMap.set(row.id, thread);
      }

      // Ajouter le participant si présent et pas déjà ajouté
      const thread = threadsMap.get(row.id)!;
      if (row.participant_id) {
        const alreadyExists = thread.participants.some(
          (u) => u.id === row.participant_id,
        );

        if (!alreadyExists) {
          thread.participants.push(
            UserMapper.mapRowToUser(row, "participant_"),
          );

          if (!thread.participantsId.includes(row.participant_id)) {
            thread.participantsId.push(row.participant_id);
          }
        }
      }
    }

    return Array.from(threadsMap.values());
  }

  private mapRowsToThreadsWithUsersAndLastMessage(
    rows: RowDataPacket[],
  ): ThreadEntityWithUsersAndLastMessage[] {
    const threadsMap = new Map<string, ThreadEntityWithUsersAndLastMessage>();

    for (const row of rows) {
      if (!threadsMap.has(row.id)) {
        const thread = ThreadEntity.from({
          id: row.id,
          administratorId: row.administrator_id,
          participantsId: [],
          title: row.title,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          isClose: row.is_close === 1,
          type: row.type,
        }) as ThreadEntityWithUsersAndLastMessage;

        thread.administrator = row.admin_id
          ? UserMapper.mapRowToUser(row, "admin_")
          : null;

        thread.participants = [];

        thread.lastMessage = row.message_id
          ? MessageMapper.mapRowToMessage(row, "message_")
          : null;

        threadsMap.set(row.id, thread);
      }

      // Ajouter le participant si présent et pas déjà ajouté
      const thread = threadsMap.get(row.id)!;
      if (row.participant_id) {
        const alreadyExists = thread.participants.some(
          (u) => u.id === row.participant_id,
        );

        if (!alreadyExists) {
          thread.participants.push(
            UserMapper.mapRowToUser(row, "participant_"),
          );

          if (!thread.participantsId.includes(row.participant_id)) {
            thread.participantsId.push(row.participant_id);
          }
        }
      }
    }

    return Array.from(threadsMap.values());
  }

  async save(thread: ThreadEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO threads
       (id, administrator_id, title, created_at, updated_at, is_close, type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        thread.id,
        thread.administratorId ?? null,
        thread.title,
        thread.createdAt,
        thread.updatedAt,
        thread.isClose ? 1 : 0,
        thread.type,
      ],
    );

    for (const participantId of thread.participantsId) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO thread_participant (thread_id, user_id) VALUES (?, ?)`,
        [thread.id, participantId],
      );
    }
  }

  async update(thread: ThreadEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE threads
       SET administrator_id = ?, title = ?, updated_at = ?, is_close = ?, type = ?
       WHERE id = ?`,
      [
        thread.administratorId,
        thread.title,
        thread.updatedAt ?? null,
        thread.isClose ? 1 : 0,
        thread.type,
        thread.id,
      ],
    );

    const existingParticipantRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM thread_participant WHERE thread_id = ?`,
      [thread.id],
    );
    const existingParticipantIds = existingParticipantRows.map(
      (r) => r.user_id,
    );
    const participantsToAdd = thread.participantsId.filter(
      (id) => !existingParticipantIds.includes(id),
    );
    for (const participantId of participantsToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO thread_participant (thread_id, user_id) VALUES (?, ?)`,
        [thread.id, participantId],
      );
    }

    const participantsToRemove = existingParticipantIds.filter(
      (id) => !thread.participantsId.includes(id),
    );
    for (const userId of participantsToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM thread_participant WHERE thread_id = ? AND user_id = ?`,
        [thread.id, userId],
      );
    }
  }

  async findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM threads WHERE id = ?`,
      [id],
    );
    if (rows.length === 0) return null;
    const threadRow = rows[0];

    const participantRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM thread_participant WHERE thread_id = ?`,
      [id],
    );
    const participantsId = participantRows.map((row) => row.user_id);
    return ThreadEntity.from({
      id: threadRow.id,
      administratorId: threadRow.administrator_id,
      participantsId: participantsId,
      title: threadRow.title,
      createdAt: threadRow.created_at,
      updatedAt: threadRow.updated_at,
      isClose: threadRow.is_close === 1,
      type: threadRow.type,
    });
  }

  async findAllWithUserAndLastMessageByParticipantIdAndType(
    participantId: string,
    type?: ThreadEntity["type"],
  ): Promise<ThreadEntityWithUsersAndLastMessage[]> {
    const conditions = ["tp.user_id = ?"];
    const params: any[] = [participantId];

    if (type) {
      conditions.push("t.type = ?");
      params.push(type);
    }

    const whereClause = conditions.join(" AND ");

    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        t.*,
        ${getUserFields("admin", "admin_")},
        ${getUserFields("p", "participant_")},
        ${getMessageFields("last_msg", "message_")}
      FROM threads t
      LEFT JOIN users admin ON t.administrator_id = admin.id
      LEFT JOIN thread_participant tp ON t.id = tp.thread_id
      LEFT JOIN users p ON tp.user_id = p.id
      LEFT JOIN (
        SELECT m1.*
        FROM messages m1
        INNER JOIN (
          SELECT thread_id, MAX(sent_at) as max_sent_at
          FROM messages
          GROUP BY thread_id
        ) m2 ON m1.thread_id = m2.thread_id 
          AND m1.sent_at = m2.max_sent_at
      ) last_msg ON t.id = last_msg.thread_id
      WHERE ${whereClause} 
      ORDER BY t.updated_at DESC, t.created_at DESC`,
      params,
    );

    return this.mapRowsToThreadsWithUsersAndLastMessage(rows);
  }

  async findWithUserById(
    threadId: string,
  ): Promise<ThreadEntityWithUsers | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        t.*,
        ${getUserFields("admin", "admin_")},
        ${getUserFields("p", "participant_")}
      FROM threads t
      LEFT JOIN users admin ON t.administrator_id = admin.id
      LEFT JOIN thread_participant tp ON t.id = tp.thread_id
      LEFT JOIN users p ON tp.user_id = p.id
      WHERE t.id = ?`,
      [threadId],
    );

    if (rows.length === 0) return null;

    const threads = this.mapRowsToThreadsWithUsers(rows);
    return threads[0] || null;
  }

  async findAllWithUserAndLastMessageByAdministratorIdAndType(
    administratorId: UserEntity["id"],
    type?: ThreadEntity["type"],
  ): Promise<ThreadEntityWithUsersAndLastMessage[]> {
    const conditions = ["t.administrator_id = ?"];
    const params: any[] = [administratorId];
    if (type) {
      conditions.push("t.type = ?");
      params.push(type);
    }

    const whereClause = conditions.join(" AND ");

    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        t.*, 
        ${getUserFields("admin", "admin_")},
        ${getUserFields("p", "participant_")},
        ${getMessageFields("last_msg", "message_")}
      FROM threads t
      JOIN users admin ON t.administrator_id = admin.id
      JOIN thread_participant tp ON t.id = tp.thread_id
      JOIN users p ON tp.user_id = p.id AND p.is_active = 1 AND p.confirmed_at IS NOT NULL
      LEFT JOIN (
        SELECT m1.*
        FROM messages m1
        INNER JOIN (
          SELECT thread_id, MAX(sent_at) as max_sent_at
          FROM messages
          GROUP BY thread_id
        ) m2 ON m1.thread_id = m2.thread_id 
          AND m1.sent_at = m2.max_sent_at
      ) last_msg ON t.id = last_msg.thread_id
      WHERE ${whereClause}
      ORDER BY t.updated_at DESC, t.created_at DESC`,
      params,
    );

    return this.mapRowsToThreadsWithUsersAndLastMessage(rows);
  }

  async findAllWithUserAndLastMessageByAdministratorNullable(): Promise<
    ThreadEntityWithUsersAndLastMessage[]
  > {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        t.*,
        ${getNullUserFields("admin_")},
        ${getUserFields("p", "participant_")},
        ${getMessageFields("last_msg", "message_")}
      FROM threads t
      JOIN thread_participant tp ON t.id = tp.thread_id
      JOIN users p ON tp.user_id = p.id AND p.is_active = 1 AND p.confirmed_at IS NOT NULL
      LEFT JOIN (
        SELECT m1.*
        FROM messages m1
        INNER JOIN (
          SELECT thread_id, MAX(sent_at) as max_sent_at
          FROM messages
          GROUP BY thread_id
        ) m2 ON m1.thread_id = m2.thread_id 
          AND m1.sent_at = m2.max_sent_at
      ) last_msg ON t.id = last_msg.thread_id
      WHERE t.administrator_id IS NULL
      ORDER BY t.updated_at DESC, t.created_at DESC`,
    );

    return this.mapRowsToThreadsWithUsersAndLastMessage(rows);
  }

  async countByAdvisor(advisorId: UserEntity["id"]): Promise<number> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT COUNT(id) as count FROM threads WHERE administrator_id = ?`,
      [advisorId],
    );
    return rows[0].count;
  }
}
