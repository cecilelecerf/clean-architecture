import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class TransactionRepositoryMySQL implements TransactionRepository {
  constructor(private readonly client: MySQLClient) {}

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<TransactionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date ASC`,
      [startDate, endDate]
    );

    return rows.map((row) =>
      TransactionEntity.from({
        id: row.id,
        fromAccountId: row.fromAccountId as IBAN,
        toAccountId: row.toAccountId as IBAN,
        amount: Money.from({ amount: row.amount, currency: row.currency }),
        label: row.label,
        icon: row.icon,
        date: row.date,
        type: row.type,
      })
    );
  }

  async findByIban(iban: IBAN): Promise<TransactionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * 
     FROM transactions 
     WHERE from_account_id = ? OR to_account_id = ? 
     ORDER BY transaction_date ASC`,

      [iban.value, iban.value]
    );

    return rows.map((row) =>
      TransactionEntity.from({
        id: row.id,
        fromAccountId: row.fromAccountId,
        toAccountId: row.toAccountId,
        amount: Money.from({ amount: row.amount, currency: row.currency }),
        label: row.label,
        icon: row.icon,
        date: row.date,
        type: row.type,
      })
    );
  }

  async save(transaction: TransactionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO transactions 
        (id, label, from_account_id, to_account_id, amount, currency, date, type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.label,
        transaction.fromAccountId.value,
        transaction.toAccountId.value,
        transaction.amount.amount,
        transaction.amount.currency,
        transaction.date,
        transaction.type,
      ]
    );
  }

  async delete(transactionId: TransactionEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM transactions WHERE id = ?`,
      [transactionId]
    );
  }
}
