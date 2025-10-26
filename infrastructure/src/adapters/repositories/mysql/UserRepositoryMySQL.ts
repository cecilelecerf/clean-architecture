import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

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
      passwordHash: row.passwordHash,
      role: row.role,
      isActiveField: row.isActiveField,
      createdAt: row.creadtedAt,
      confirmedAt: row.confirmedAt,
      modifiedAt: row.modifiedAt,
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
      passwordHash: row.passwordHash,
      role: row.role,
      isActiveField: row.isActiveField,
      createdAt: row.creadtedAt,
      confirmedAt: row.confirmedAt,
      modifiedAt: row.modifiedAt,
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
        passwordHash: row.passwordHash,
        role: row.role,
        isActiveField: row.isActiveField,
        createdAt: row.creadtedAt,
        confirmedAt: row.confirmedAt,
        modifiedAt: row.modifiedAt,
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
        passwordHash: row.passwordHash,
        role: row.role,
        isActiveField: row.isActiveField,
        createdAt: row.creadtedAt,
        confirmedAt: row.confirmedAt,
        modifiedAt: row.modifiedAt,
      })
    );
  }

  async save(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO users 
        (id, firstname, lastname, email, passwordHash, role, isActiveField, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.firstname,
        user.lastname,
        user.email,
        user.passwordHash,
        user.role,
        user.isActiveField,
        user.createdAt,
      ]
    );
  }

  async update(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE users 
       SET firstname = ?, lastname = ?, email = ?, passwordHash = ?, role = ?, isActiveField = ?, createdAt = ?, confirmedAt = ?, modifiedAt = ? 
       WHERE id = ?`,
      [
        user.firstname,
        user.lastname,
        user.email,
        user.passwordHash,
        user.role,
        user.isActiveField,
        user.createdAt,
        user.confirmedAt,
        user.modifiedAt,
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
