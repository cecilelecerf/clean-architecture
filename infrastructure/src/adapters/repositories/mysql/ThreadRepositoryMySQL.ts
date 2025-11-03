import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class ThreadRepositoryMySQL implements ThreadRepository {
  constructor(private readonly client: MySQLClient) {}

  /** 📬 Sauvegarder un thread et ses participants */
  async save(thread: ThreadEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO threads
       (id, administrator_id, title, created_at, last_updated_at, is_close, type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        thread.id,
        thread.administratorId,
        thread.title,
        thread.createdAt,
        thread.lastUpdatedAt ?? null,
        thread.isClose ? 1 : 0,
        thread.type,
      ]
    );

    // Insert participants dans la table de liaison
    for (const participantId of thread.participantsId) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO thread_participant (thread_id, user_id) VALUES (?, ?)`,
        [thread.id, participantId]
      );
    }
  }

  /** 🔄 Mettre à jour un thread et ses participants */
  async update(thread: ThreadEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE threads
       SET administrator_id = ?, title = ?, last_updated_at = ?, is_close = ?, type = ?
       WHERE id = ?`,
      [
        thread.administratorId,
        thread.title,
        thread.lastUpdatedAt ?? null,
        thread.isClose ? 1 : 0,
        thread.type,
        thread.id,
      ]
    );

    const existingParticipantRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM thread_participant WHERE thread_id = ?`,
      [thread.id]
    );
    const existingParticipantIds = existingParticipantRows.map((r) => r.userId);

    const participantsToAdd = thread.participantsId.filter(
      (id) => !existingParticipantIds.includes(id)
    );
    for (const participantId of participantsToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO post_tag (thread_id, participant_id) VALUES (?, ?)`,
        [thread.id, participantId]
      );
    }

    const tagsToRemove = existingParticipantIds.filter(
      (id) => !thread.participantsId.includes(id)
    );
    for (const userId of tagsToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM post_tag WHERE thread_id = ? AND user_id = ?`,
        [thread.id, userId]
      );
    }
  }

  /** ❌ Supprimer un thread et ses participants */
  async delete(threadId: ThreadEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM threads WHERE id = ?`,
      [threadId]
    );
  }

  /** 🔍 Trouver un thread par son ID avec participants */
  async findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM threads WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const threadRow = rows[0];

    const participantRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM thread_participant WHERE thread_id = ?`,
      [id]
    );
    const participantsId = participantRows.map((row) => row.userId);

    return ThreadEntity.from({
      id: threadRow.id,
      administratorId: threadRow.administratorId,
      participantsId,
      title: threadRow.title,
      createdAt: threadRow.createdAt,
      lastUpdatedAt: threadRow.lastUpdatedAt,
      isClose: threadRow.isClose === 1,
      type: threadRow.type,
    });
  }

  /** 🔍 Tous les threads d’un user */
  async findAllByUserId(userId: UserEntity["id"]): Promise<ThreadEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT t.* 
       FROM threads t
       JOIN thread_participant tp ON tp.thread_id = t.id
       WHERE tp.user_id = ?`,
      [userId]
    );

    const threads: ThreadEntity[] = [];
    for (const row of rows) {
      const participantRows = await this.client.query<RowDataPacket[]>(
        `SELECT userId FROM thread_participant WHERE thread_id = ?`,
        [row.id]
      );
      const participantsId = participantRows.map((r) => r.userId);
      threads.push(
        ThreadEntity.from({
          id: row.id,
          administratorId: row.administratorId,
          participantsId,
          title: row.title,
          createdAt: row.createdAt,
          lastUpdatedAt: row.lastUpdatedAt,
          isClose: row.isClose === 1,
          type: row.type,
        })
      );
    }
    return threads;
  }

  /** 🔍 Tous les threads d’un conseiller */
  async findAllByAdvisorId(
    advisorId: UserEntity["id"]
  ): Promise<ThreadEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM threads WHERE administrator_id = ?`,
      [advisorId]
    );

    return Promise.all(
      rows.map(async (row) => {
        const participantRows = await this.client.query<RowDataPacket[]>(
          `SELECT user_id FROM thread_participant WHERE thread_id = ?`,
          [row.id]
        );
        const participantsId = participantRows.map((r) => r.userId);
        return ThreadEntity.from({
          id: row.id,
          administratorId: row.administratorId,
          participantsId,
          title: row.title,
          createdAt: row.createdAt,
          lastUpdatedAt: row.lastUpdatedAt,
          isClose: row.isClose === 1,
          type: row.type,
        });
      })
    );
  }
}
