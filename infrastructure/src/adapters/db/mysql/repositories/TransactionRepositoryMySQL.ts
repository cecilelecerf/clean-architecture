import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class TransactionRepositoryMySQL implements TransactionRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToTransaction(row: RowDataPacket): TransactionEntity {
    const fromAccountId = IBAN.from(row.from_account_id);

    const toAccountId = IBAN.from(row.to_account_id);

    const amount = Money.from({ amount: row.amount, currency: row.currency });

    return TransactionEntity.from({
      id: row.id,
      fromAccountId,
      toAccountId,
      amount,
      label: row.label,
      icon: row.icon,
      date: row.date,
      type: row.type,
    });
  }

  /** Transactions par période */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<TransactionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC`,
      [startDate, endDate]
    );

    return rows.map((row) => this.mapRowToTransaction(row));
  }

  /** Transactions par IBAN */
  async findByIban(iban: IBAN): Promise<TransactionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM transactions 
       WHERE from_account_id = ? OR to_account_id = ? 
       ORDER BY date DESC`,
      [iban.value, iban.value]
    );

    return rows.map((row) => this.mapRowToTransaction(row));
  }

  /** Sauvegarder une transaction */
  async save(transaction: TransactionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO transactions 
        (id, label, icon, from_account_id, to_account_id, amount, currency, date, type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.label,
        transaction.icon,
        transaction.fromAccountId.value,
        transaction.toAccountId.value,
        transaction.amount.amount,
        transaction.amount.currency,
        transaction.date,
        transaction.type,
      ]
    );
  }

  /** Supprimer une transaction */
  async delete(transactionId: TransactionEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM transactions WHERE id = ?`,
      [transactionId]
    );
  }
}
