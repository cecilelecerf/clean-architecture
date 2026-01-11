import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { Email } from "@domain/values/Email";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserMapper } from "../../mappers/UserMapper";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class UserRepositoryMySQL implements UserRepository {
  constructor(private readonly client: MySQLClient) {}

  async findById(id: UserEntity["id"]): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (!rows.length) return null;
    return UserMapper.mapRowToUser(rows[0]);
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email.value]
    );

    if (!rows.length) return null;
    return UserMapper.mapRowToUser(rows[0]);
  }

  async findByIban(iban: AccountEntity["iban"]): Promise<UserEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `
      SELECT u.*
      FROM users u
      INNER JOIN accounts a ON a.user_id = u.id
      WHERE a.iban = ?
      `,
      [iban]
    );

    if (!rows.length) return null;
    return UserMapper.mapRowToUser(rows[0]);
  }

  async findAllByRoleAndIsActif(
    role?: UserEntity["role"]
  ): Promise<UserEntity[]> {
    let query = `
      SELECT * FROM users
      WHERE is_active = 1
        AND confirmed_at IS NOT NULL
    `;
    const params: any[] = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    query += " ORDER BY lastname ASC, firstname ASC";

    const rows = await this.client.query<RowDataPacket[]>(query, params);
    return rows.map((row) => UserMapper.mapRowToUser(row));
  }

  async save(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `
      INSERT INTO users (
        id,
        firstname,
        lastname,
        email,
        password_hash,
        role,
        is_active,
        phone_number,
        sexe,
        date_of_birth,
        address,
        city,
        country,
        postal_code,
        created_at,
        updated_at,
        confirmed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user.id,
        user.firstname,
        user.lastname,
        user.email.value,
        user.passwordHash,
        user.role,
        user.isActiveField,
        user.phoneNumber ?? null,
        user.sexe ?? null,
        user.dateOfBirth ?? null,
        user.address?.address ?? null,
        user.address?.city ?? null,
        user.address?.country ?? null,
        user.address?.postalCode ?? null,
        user.createdAt,
        user.updatedAt,
        user.confirmedAt ?? null,
      ]
    );
  }

  async update(user: UserEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `
      UPDATE users SET
        firstname = ?,
        lastname = ?,
        email = ?,
        password_hash = ?,
        role = ?,
        is_active = ?,
        phone_number = ?,
        sexe = ?,
        date_of_birth = ?,
        address = ?,
        city = ?,
        country = ?,
        postal_code = ?,
        confirmed_at = ?,
        updated_at = ?
      WHERE id = ?
      `,
      [
        user.firstname,
        user.lastname,
        user.email.value,
        user.passwordHash,
        user.role,
        user.isActiveField,
        user.phoneNumber ?? null,
        user.sexe ?? null,
        user.dateOfBirth ?? null,
        user.address?.address ?? null,
        user.address?.city ?? null,
        user.address?.country ?? null,
        user.address?.postalCode ?? null,
        user.confirmedAt ?? null,
        user.updatedAt,
        user.id,
      ]
    );
  }

  async countUserByRole(role: UserEntity["role"]): Promise<number> {
    const rows = await this.client.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) as count
      FROM users
      WHERE role = ?
        AND is_active = 1
        AND confirmed_at IS NOT NULL
      `,
      [role]
    );

    return rows[0].count;
  }
}
