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
      updatedAt: row.modified_at,
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
      updatedAt: row.modified_at,
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
        updatedAt: row.modified_at,
      })
    );
  }

  async findAllByRoleAndIsActif(
    role?: UserEntity["role"]
  ): Promise<UserEntity[]> {
    let query =
      "SELECT * FROM users WHERE is_active = 1 AND confirmed_at IS NOT NULL";
    const params: any[] = [];

    if (!!role) {
      query += " AND role = ?";
      params.push(role);
    }
    const rows = await this.client.query<RowDataPacket[]>(query, params);
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
        updatedAt: row.modified_at,
      })
    );
  }

  async save(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO users 
      (id, firstname, lastname, email, password_hash, role, is_active, created_at, confirmed_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        user.updatedAt ?? null,
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
         updated_at = ? 
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
        user.updatedAt ?? null,
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
}
