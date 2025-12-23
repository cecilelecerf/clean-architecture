import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { Color } from "@domain/values/Color";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { AccountMapper } from "../../mappers/AccountMapper";

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
      "SELECT * FROM accounts WHERE type = 'epargne' AND userId = null"
    );

    if (rows.length === 0) return null;

    return AccountMapper.mapRowToAccount(rows[0]);
  }

  /** Trouver une liste de compte par type */
  async findByType(type: string): Promise<AccountEntity[]>
  {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE type = ? ORDER BY created_at DESC",
      [type]
    );

    return rows.map((row) => AccountMapper.mapRowToAccount(row));
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
