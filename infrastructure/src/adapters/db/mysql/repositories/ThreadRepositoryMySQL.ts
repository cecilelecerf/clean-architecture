import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserDto } from "@infrastructure/types/user";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UserRepositoryMySQL } from "./UserRepositoryMySQL";

export class ThreadRepositoryMySQL implements ThreadRepository {
  constructor(private readonly client: MySQLClient) {}

  /** 📬 Sauvegarder un thread et ses participants */
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
        thread.updatedAt ?? thread.createdAt,
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
       SET administrator_id = ?, title = ?, updated_at = ?, is_close = ?, type = ?
       WHERE id = ?`,
      [
        thread.administratorId,
        thread.title,
        thread.updatedAt ?? null,
        thread.isClose ? 1 : 0,
        thread.type,
        thread.id,
      ]
    );

    const existingParticipantRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM thread_participant WHERE thread_id = ?`,
      [thread.id]
    );
    console.log(existingParticipantRows);
    const existingParticipantIds = existingParticipantRows.map(
      (r) => r.user_id
    );
    console.log(existingParticipantIds);
    const participantsToAdd = thread.participantsId.filter(
      (id) => !existingParticipantIds.includes(id)
    );
    console.log(participantsToAdd);
    for (const participantId of participantsToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO thread_participant (thread_id, user_id) VALUES (?, ?)`,
        [thread.id, participantId]
      );
    }

    const participantsToRemove = existingParticipantIds.filter(
      (id) => !thread.participantsId.includes(id)
    );
    for (const userId of participantsToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM thread_participant WHERE thread_id = ? AND user_id = ?`,
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

  /** 🔍 Tous les threads d’un user */
  async findAllByParticipantId(
    userId: UserEntity["id"]
  ): Promise<ThreadEntity[]> {
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
          administratorId: row.administrator_id,
          participantsId: row.participants_id,
          title: row.title,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isClose: row.isClose === 1,
          type: row.type,
        })
      );
    }
    return threads;
  }

  /** 🔍 Tous les threads d’un conseiller */
  async findAllByAdministratorId(
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
          administratorId: row.administrator_id,
          participantsId: row.participants_id,
          title: row.title,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isClose: row.isClose === 1,
          type: row.type,
        });
      })
    );
  }

  /**
   * Récupère les threads ouverts pour un participant donné avec les informations de l'administrateur
   */
  async findAllExternalThreadWithUserByUserId(
    participantId: string
  ): Promise<ThreadEntityWithUsers[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `
    SELECT 
      t.*,
      
      admin.id AS admin_id,
      admin.firstname AS admin_firstname,
      admin.lastname AS admin_lastname,
      admin.email AS admin_email,
      admin.role AS admin_role,
      admin.created_at AS admin_created_at,
      admin.is_active AS admin_is_active,
      admin.password_hash AS admin_password_hash,
      p.id AS participant_id,
      p.firstname AS participant_firstname,
      p.lastname AS participant_lastname,
      p.email AS participant_email,
      p.role AS participant_role,
      p.created_at AS participant_created_at,
      p.is_active AS participant_is_active

    FROM threads t
    LEFT JOIN users admin ON t.administrator_id = admin.id
    LEFT JOIN thread_participant tp ON t.id = tp.thread_id
    LEFT JOIN users p ON tp.user_id = p.id
    WHERE t.is_close = 0
      AND (tp.user_id = ? OR t.administrator_id = ?)
    ORDER BY t.updated_at DESC, t.created_at DESC
    `,
      [participantId, participantId]
    );
    const map = new Map<number, ThreadEntityWithUsers>();

    for (const row of rows) {
      let thread = map.get(row.id);

      if (!thread) {
        const admin = row.admin_id
          ? UserEntity.from({
              id: row.admin_id,
              firstname: row.admin_firstname,
              lastname: row.admin_lastname,
              email: row.admin_email,
              passwordHash: row.admin_password_hash,
              role: row.admin_role,
              isActiveField: row.admin_is_active,
              createdAt: row.admin_created_at,
            })
          : null;

        const entity = ThreadEntity.from({
          id: row.id,
          administratorId: row.administrator_id,
          participantsId: [],
          title: row.title,
          createdAt: new Date(row.created_at),
          updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
          isClose: row.is_close === 1,
          type: row.type,
        });

        thread = entity as ThreadEntityWithUsers;
        thread.administrator = admin;
        thread.participants = [];

        map.set(row.id, thread);
      }
      if (row.participant_id) {
        const alreadyExists = thread.participants.some(
          (u) => u.id === row.participant_id
        );

        if (!alreadyExists) {
          thread.participants.push(
            UserEntity.from({
              id: row.participant_id,
              firstname: row.participant_firstname,
              lastname: row.participant_lastname,
              email: row.participant_email,
              role: row.participant_role,
              isActiveField: row.participant_is_active,
              createdAt: row.participant_created_at,
              passwordHash: row.participant_password_hash,
            })
          );
        }
      }
    }

    return [...map.values()];
  }

  async findWithUserById(
    threadId: string
  ): Promise<ThreadEntityWithUsers | null> {
    const threadRows = await this.client.query<RowDataPacket[]>(
      `SELECT t.*,  
          admin.id as admin_id,
          admin.firstname as admin_firstname,
          admin.lastname as admin_lastname,
          admin.email as admin_email,
          admin.role as admin_role,
          admin.created_at as admin_created_at,
          admin.is_active as admin_is_active
      FROM threads t
      LEFT JOIN users admin ON t.administrator_id = admin.id
      WHERE t.id = ?`,
      [threadId]
    );

    if (threadRows.length === 0) return null;

    const threadRow = threadRows[0];

    const participantRows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        p.id,
        p.firstname,
        p.lastname,
        p.email,
        p.role,
        p.created_at,
        p.is_active
    FROM thread_participant tp
    JOIN users p ON tp.user_id = p.id
    WHERE tp.thread_id = ?`,
      [threadId]
    );
    const thread = ThreadEntity.from({
      id: threadRow.id,
      administratorId: threadRow.administrator_id,
      participantsId: [],
      title: threadRow.title,
      createdAt: new Date(threadRow.created_at),
      updatedAt: threadRow.updated_at
        ? new Date(threadRow.updated_at)
        : undefined,
      isClose: threadRow.is_close === 1,
      type: threadRow.type,
    });

    const administrator = threadRow.admin_id
      ? UserEntity.from({
          id: threadRow.admin_id,
          firstname: threadRow.admin_firstname,
          lastname: threadRow.admin_lastname,
          email: threadRow.admin_email,
          role: threadRow.admin_role,
          createdAt: new Date(threadRow.admin_created_at),
          isActiveField: threadRow.admin_is_active === 1,
          passwordHash: threadRow.password_hash,
        })
      : null;
    const participants: UserEntity[] = [];
    for (const row of participantRows) {
      participants.push(
        UserEntity.from({
          id: row.id,
          firstname: row.firstname,
          lastname: row.lastname,
          email: row.email,
          role: row.role,
          createdAt: new Date(row.created_at),
          isActiveField: row.is_active === 1,
          passwordHash: row.password_hash,
        })
      );
    }

    thread.participantsId = participants.map((p) => p.id);

    return Object.assign(thread, { administrator, participants });
  }

  async findAllWithUserByAdministratorId(
    administratorId: UserEntity["id"]
  ): Promise<ThreadEntityWithUsers[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT t.*, 
          admin.id as admin_id,
          admin.firstname as admin_firstname,
          admin.lastname as admin_lastname,
          admin.email as admin_email,
          admin.role as admin_role,
          admin.created_at as admin_created_at,
          admin.is_active as admin_is_active,
          admin.password_hash as admin_password_hash,
          p.id as participant_id,
          p.firstname as participant_firstname,
          p.lastname as participant_lastname,
          p.email as participant_email,
          p.role as participant_role,
          p.created_at as participant_created_at,
          p.is_active as participant_is_active,
          p.password_hash as participant_password_hash
    FROM threads t
    JOIN users admin ON t.administrator_id = admin.id
    JOIN thread_participant tp ON t.id = tp.thread_id
    JOIN users p ON tp.user_id = p.id AND p.is_active = 1 AND p.confirmed_at IS NOT NULL
    WHERE t.administrator_id = ?
    `,
      [administratorId]
    );

    const threadsMap = new Map<string, ThreadEntityWithUsers>();

    for (const row of rows) {
      if (!threadsMap.has(row.id)) {
        const thread = ThreadEntity.from({
          id: row.id,
          administratorId: row.administrator_id,
          participantsId: [],
          title: row.title,
          createdAt: new Date(row.created_at),
          updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
          isClose: row.is_close === 1,
          type: row.type,
        }) as ThreadEntityWithUsers;

        thread.administrator = UserEntity.from({
          id: row.admin_id,
          firstname: row.admin_firstname,
          lastname: row.admin_lastname,
          email: row.admin_email,
          role: row.admin_role,
          createdAt: new Date(row.admin_created_at),
          isActiveField: row.admin_is_active === 1,
          passwordHash: row.admin_password_hash,
        });

        thread.participants = [];
        threadsMap.set(row.id, thread);
      }

      const thread = threadsMap.get(row.id)!;
      thread.participants.push(
        UserEntity.from({
          id: row.participant_id,
          firstname: row.participant_firstname,
          lastname: row.participant_lastname,
          email: row.participant_email,
          role: row.participant_role,
          createdAt: new Date(row.participant_created_at),
          isActiveField: row.participant_is_active === 1,
          passwordHash: row.participant_password_hash,
        })
      );

      if (!thread.participantsId.includes(row.participant_id)) {
        thread.participantsId.push(row.participant_id);
      }
    }

    return Array.from(threadsMap.values());
  }

  async findAllWithUserByAdministratorNullable(): Promise<
    ThreadEntityWithUsers[]
  > {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT t.*,
      p.id as participant_id,
      p.firstname as participant_firstname,
      p.lastname as participant_lastname,
      p.email as participant_email,
      p.role as participant_role,
      p.created_at as participant_created_at,
      p.is_active as participant_is_active,
      p.password_hash as participant_password_hash
      FROM threads t
      JOIN thread_participant tp ON t.id = tp.thread_id
      JOIN users p ON tp.user_id = p.id AND p.is_active = 1 AND p.confirmed_at IS NOT NULL
       WHERE t.administrator_id IS NULL
    `
    );

    const threadsMap = new Map<string, ThreadEntityWithUsers>();

    for (const row of rows) {
      if (!threadsMap.has(row.id)) {
        const thread = ThreadEntity.from({
          id: row.id,
          administratorId: row.administrator_id,
          participantsId: [],
          title: row.title,
          createdAt: new Date(row.created_at),
          updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
          isClose: row.is_close === 1,
          type: row.type,
        }) as ThreadEntityWithUsers;

        thread.administrator = row.admin_id
          ? UserEntity.from({
              id: row.admin_id,
              firstname: row.admin_firstname,
              lastname: row.admin_lastname,
              email: row.admin_email,
              role: row.admin_role,
              createdAt: new Date(row.admin_created_at),
              isActiveField: row.admin_is_active === 1,
              passwordHash: row.admin_password_hash,
            })
          : null;

        thread.participants = [];
        threadsMap.set(row.id, thread);
      }

      const thread = threadsMap.get(row.id)!;
      thread.participants.push(
        UserEntity.from({
          id: row.participant_id,
          firstname: row.participant_firstname,
          lastname: row.participant_lastname,
          email: row.participant_email,
          role: row.participant_role,
          createdAt: new Date(row.participant_created_at),
          isActiveField: row.participant_is_active === 1,
          passwordHash: row.participant_password_hash,
        })
      );

      if (!thread.participantsId.includes(row.participant_id)) {
        thread.participantsId.push(row.participant_id);
      }
    }

    return Array.from(threadsMap.values());
  }
}
