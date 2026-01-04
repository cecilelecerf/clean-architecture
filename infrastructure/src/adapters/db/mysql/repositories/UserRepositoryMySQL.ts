import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { Email } from "@domain/values/Email";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserMapper } from "../../mappers/UserMapper";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class UserRepositoryMySQL implements UserRepository {
  constructor(private readonly client: MySQLClient) {}

  /** Trouver un utilisateur par ID */
  async findById(id: UserEntity["id"]): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;

    return UserMapper.mapRowToUser(rows[0]);
  }

  /** Trouver un utilisateur par email */
  async findByEmail(email: Email): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email.value]
    );

    if (rows.length === 0) return null;

    return UserMapper.mapRowToUser(rows[0]);
  }

  /** Trouver un utilisateur par iban */
  async findByIban(iban: AccountEntity["iban"]): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users u LEFT JOIN accounts a ON u.id = a.user_id WHERE a.iban = ? ",
      [iban]
    );

    if (rows.length === 0) return null;

    return UserMapper.mapRowToUser(rows[0]);
  }

  /** Tous les utilisateurs */
  async findAll(): Promise<UserEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users ORDER BY created_at DESC"
    );

    return rows.map((row) => UserMapper.mapRowToUser(row));
  }

  /** Utilisateurs actifs par rôle */
  async findAllByRoleAndIsActif(
    role?: UserEntity["role"]
  ): Promise<UserEntity[]> {
    let query =
      "SELECT * FROM users WHERE is_active = 1 AND confirmed_at IS NOT NULL";
    const params: any[] = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    query += " ORDER BY lastname ASC, firstname ASC";

    const rows = await this.client.query<RowDataPacket[]>(query, params);

    return rows.map((row) => UserMapper.mapRowToUser(row));
  }

  /** Sauvegarder un utilisateur */
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
        user.updatedAt,
      ]
    );
  }

  /** Mettre à jour un utilisateur */
  async update(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE users 
     SET firstname = ?, 
         lastname = ?, 
         email = ?, 
         password_hash = ?, 
         role = ?, 
         is_active = ?, 
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
        user.confirmedAt ?? null,
        user.updatedAt,
        user.id,
      ]
    );
  }

  /** Supprimer un utilisateur */
  async delete(id: UserEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>("DELETE FROM users WHERE id = ?", [
      id,
    ]);
  }

  /** Utilisateurs actifs par rôle */
  async countUserByRole(role: UserEntity["role"]): Promise<number> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND confirmed_at IS NOT NULL AND role = ?",
      [role]
    );

    return rows[0].count;
  }
}
