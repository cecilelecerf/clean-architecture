import {
  AccountEntityWithUser,
  AccountRepository,
} from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { AccountMapper } from "../../mappers/AccountMapper";
import { UserMapper } from "../../mappers/UserMapper";

export class AccountRepositoryMySQL implements AccountRepository {
  constructor(private readonly client: MySQLClient) {}

  /** Tous les comptes d'un utilisateur */
  async findByUserId(
    userId: UserEntity["id"] | null
  ): Promise<AccountEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return rows.map((row) => AccountMapper.mapRowToAccount(row));
  }

  /** Trouver un compte par IBAN */
  async findByIBAN(iban: IBAN): Promise<AccountEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE iban = ?",
      [iban.value]
    );

    if (rows.length === 0) return null;

    return AccountMapper.mapRowToAccount(rows[0]);
  }

  /** Tous les comptes épargne */
  async findAllSavingsAccounts(): Promise<AccountEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE type = 'epargne' ORDER BY created_at DESC"
    );

    return rows.map((row) => AccountMapper.mapRowToAccount(row));
  }

  /** Compte d'intérêts de la banque */
  async findBankInterestAccount(): Promise<AccountEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE type = 'epargne' AND user_id IS NULL"
    );

    if (rows.length === 0) return null;

    return AccountMapper.mapRowToAccount(rows[0]);
  }

  /** Trouver une liste de compte par type */
  async findByType(type: string): Promise<AccountEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE type = ? ORDER BY created_at DESC",
      [type]
    );

    return rows.map((row) => AccountMapper.mapRowToAccount(row));
  }
  /** Trouver une liste de compte par type */
  async findByTypeSection(type: "client" | "bank"): Promise<AccountEntity[]> {
    const conditions = type === "client" ? "NOT NULL" : "IS NULL";

    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM accounts WHERE user_id IS ${conditions} ORDER BY created_at DESC`
    );

    return rows.map((row) => AccountMapper.mapRowToAccount(row));
  }

  /** Trouver une liste de compte par type avec les users */
  async findByTypeSectionWithUser(
    type: "client" | "bank"
  ): Promise<AccountEntityWithUser[]> {
    const condition = type === "client" ? "IS NOT NULL" : "IS NULL";

    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      a.*,
      u.id as user_id,
      u.email as user_email,
      u.password_hash as user_password_hash,
      u.firstname as user_firstname,
      u.lastname as user_lastname,
      u.role as user_role,
      u.is_active as user_is_active,
      u.created_at as user_created_at,
      u.updated_at as user_updated_at,
      u.confirmed_at as user_confirmed_at
    FROM accounts a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.user_id ${condition}
    ORDER BY a.created_at DESC`
    );

    return rows.map((row) => {
      const account = AccountMapper.mapRowToAccount(row);
      const user = UserMapper.mapRowToUser(row, "user_");
      return Object.assign(account, { user });
    });
  }

  /** Sauvegarder un compte */
  async save(account: AccountEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO accounts 
        (iban, user_id, name, type, color, balance, currency, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.iban.value,
        account.userId,
        ,
        account.name,
        account.type,
        account.color.getValue(),
        account.balance.amount,
        account.balance.currency,
        account.createdAt,
        account.updatedAt,
      ]
    );
  }

  /** Mettre à jour un compte */
  async update(account: AccountEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE accounts 
       SET user_id = ?, name = ?, type = ?, color = ?, balance = ?, currency = ?, updated_at = ? 
       WHERE iban = ?`,
      [
        account.userId,
        account.name,
        account.type,
        account.color.getValue(),
        account.balance.amount,
        account.balance.currency,
        account.updatedAt,
        account.iban.value,
      ]
    );
  }

  /** Supprimer un compte */
  async delete(iban: IBAN): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM accounts WHERE iban = ?",
      [iban.value]
    );
  }
}
