import { MySQLClient } from "@adapters/db/MySQLClient";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
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
        userId: row.userId,
        name: row.name,
        type: row.type,
        balance: Money.from({ amount: row.balence, currency: row.currency }),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  async findByIBAN(iban: IBAN): Promise<AccountEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM accounts WHERE iban = ?",
      [iban]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return AccountEntity.from({
      iban: row.iban,
      userId: row.userId,
      name: row.name,
      type: row.type,
      balance: Money.from({ amount: row.balence, currency: row.currency }),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(account: AccountEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO accounts 
        (iban, user_id, name, type, balance, cuurency, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        account.iban,
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
       SET user_id = ?, name = ?, type = ?, balance = ?, createdAt = ? 
       WHERE iban = ?`,
      [
        account.userId,
        account.name,
        account.type,
        account.balance,
        account.createdAt,
        account.iban,
      ]
    );
  }

  async delete(iban: IBAN): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM accounts WHERE iban = ?",
      [iban]
    );
  }
}
