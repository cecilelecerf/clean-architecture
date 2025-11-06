import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { Email } from "@domain/values/Email";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UserEntity } from "@domain/entities/UserEntity";

export class UserRepositoryMySQL implements UserRepository {
  constructor(private readonly client: MySQLClient) {}

  async findById(id: UserEntity["id"]): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;
    const row = rows[0];
    return UserEntity.from({
      id: row.id,
      firstname: row.firstname,
      lastname: row.lastname,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActiveField: row.is_active,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
      modifiedAt: row.modified_at,
      advisorId: row.advisor_id,
    });
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email.value]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return UserEntity.from({
      id: row.id,
      firstname: row.firstname,
      lastname: row.lastname,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActiveField: row.is_active,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
      modifiedAt: row.modified_at,
      advisorId: row.advisor_id,
    });
  }

  async findAll(): Promise<UserEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users"
    );
    return rows.map((row) =>
      UserEntity.from({
        id: row.id,
        firstname: row.firstname,
        lastname: row.lastname,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        isActiveField: row.is_active,
        createdAt: row.created_at,
        confirmedAt: row.confirmed_at,
        modifiedAt: row.modified_at,
        advisorId: row.advisor_id,
      })
    );
  }

  async findAllByRole(role: UserEntity["role"]): Promise<UserEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE role = ?",
      [role]
    );
    return rows.map((row) =>
      UserEntity.from({
        id: row.id,
        firstname: row.firstname,
        lastname: row.lastname,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        isActiveField: row.is_active,
        createdAt: row.created_at,
        confirmedAt: row.confirmed_at,
        modifiedAt: row.modified_at,
        advisorId: row.advisor_id,
      })
    );
  }

  async save(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO users 
      (id, firstname, lastname, email, password_hash, role, is_active, created_at, confirmed_at, modified_at, advisor_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.firstname,
        user.lastname,
        user.email.value,
        user.passwordHash,
        user.role,
        user.isActiveField,
        user.createdAt,
        user.confirmedAt ?? null,
        user.modifiedAt ?? null,
        user.advisorId ?? null,
      ]
    );
  }

  async update(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE users 
     SET firstname = ?, 
         lastname = ?, 
         email = ?, 
         password_hash = ?, 
         role = ?, 
         is_active = ?, 
         created_at = ?, 
         confirmed_at = ?, 
         modified_at = ? 
         advisor_id = ?
     WHERE id = ?`,
      [
        user.firstname,
        user.lastname,
        user.email.value,
        user.passwordHash,
        user.role,
        user.isActiveField,
        user.createdAt,
        user.confirmedAt ?? null,
        user.modifiedAt ?? null,
        user.advisorId ?? null,
        user.id,
      ]
    );
  }

  async delete(id: UserEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM users WHERE iban = ?",
      [id]
    );
  }

  async findLeastAssignedActiveAdvisor(): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(`
    SELECT 
        u.*
        COUNT(c.id) AS client_count
    FROM users u
    LEFT JOIN users c ON c.advisor_id = u.id AND c.role = 'client' AND c.is_active = TRUE
    WHERE u.role = 'conseiller'
      AND u.is_active = TRUE
    GROUP BY u.id, u.firstname, u.lastname, u.email
    ORDER BY client_count ASC
    LIMIT 1;
    `);

    if (rows.length === 0) return null;
    const row = rows[0];
    return UserEntity.from({
      id: row.id,
      firstname: row.firstname,
      lastname: row.lastname,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActiveField: row.is_active,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
      modifiedAt: row.modified_at,
    });
  }

  async findAllByAdvisor(advisorId: UserEntity["id"]): Promise<UserEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE advisor_id = ?",
      [advisorId]
    );
    return rows.map((row) =>
      UserEntity.from({
        id: row.id,
        firstname: row.firstname,
        lastname: row.lastname,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        isActiveField: row.is_active,
        createdAt: row.created_at,
        confirmedAt: row.confirmed_at,
        modifiedAt: row.modified_at,
        advisorId: row.advisor_id,
      })
    );
  }
}
