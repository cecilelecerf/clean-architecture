import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class AccountRepositoryMySQL implements AccountRepository {
  constructor(private readonly client: MySQLClient) {}

  async findByUserId(userId: UserEntity["id"]): Promise<AccountEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE user_id = ?",
      [userId]
    );
    return rows.map((row) =>
      AccountEntity.from({
        iban: row.iban,
        userId: row.user_id,
        name: row.name,
        type: row.type,
        color: row.color,
        balance: Money.from({ amount: row.balance, currency: row.currency }),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  async findByIBAN(iban: IBAN): Promise<AccountEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE iban = ?",
      [iban.value]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return AccountEntity.from({
      iban: row.iban,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      color: row.color,
      balance: Money.from({ amount: row.balance, currency: row.currency }),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findAllSavingsAccounts(): Promise<AccountEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM accounts WHERE type = 'epargne'`
    );
    return rows.map((row) =>
      AccountEntity.from({
        iban: row.iban,
        userId: row.user_id,
        name: row.name,
        type: row.type,
        color: row.color,
        balance: Money.from({ amount: row.balance, currency: row.currency }),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  async save(account: AccountEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO accounts 
        (iban, user_id, name, type, balance, currency, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        account.iban.value,
        account.userId,
        account.name,
        account.type,
        account.balance.amount,
        account.balance.currency,
        account.createdAt,
      ]
    );
  }

  async update(account: AccountEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE accounts 
       SET user_id = ?, name = ?, type = ?, balance = ?, currency = ?, updated_at = ? 
       WHERE iban = ?`,
      [
        account.userId,
        account.name,
        account.type,
        account.balance.amount,
        account.balance.currency,
        account.updatedAt,
        account.iban.value,
      ]
    );
  }

  async delete(iban: IBAN): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM accounts WHERE iban = ?",
      [iban.value]
    );
  }
}
