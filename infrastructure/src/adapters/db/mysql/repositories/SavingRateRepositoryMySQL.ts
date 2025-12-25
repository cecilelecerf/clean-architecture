import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { Percentage } from "@domain/values/Percentage";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class SavingsRateRepositoryMySQL implements SavingRateRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToSavingsRate(row: RowDataPacket): SavingsRateEntity {
    const rate = Percentage.from({ value: row.rate });
    return SavingsRateEntity.from({
      id: row.id,
      rate,
      effectiveDate: row.effective_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /** Taux d'épargne actuel */
  async findRateAtDate(date: Date): Promise<SavingsRateEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM savings_rates 
       WHERE effective_date <= ? 
       ORDER BY effective_date DESC 
       LIMIT 1`,
      [date]
    );

    if (rows.length === 0) return null;

    return this.mapRowToSavingsRate(rows[0]);
  }

  /** Tous les taux d'épargne */
  async findAll(): Promise<SavingsRateEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM savings_rates ORDER BY effective_date DESC`
    );

    return rows.map((row) => this.mapRowToSavingsRate(row));
  }

  /** Trouver un taux par ID */
  async findById(
    id: SavingsRateEntity["id"]
  ): Promise<SavingsRateEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM savings_rates WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRowToSavingsRate(rows[0]);
  }

  /** Sauvegarder un taux d'épargne */
  async save(savingsRate: SavingsRateEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO savings_rates (id, rate, effective_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [
        savingsRate.id,
        savingsRate.rate.value,
        savingsRate.effectiveDate,
        savingsRate.createdAt,
        savingsRate.updatedAt,
      ]
    );
  }

  /** Mettre à jour un taux d'épargne */
  async update(savingsRate: SavingsRateEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE savings_rates SET rate = ?, effective_date = ?, updated_at = ? WHERE id = ?`,
      [
        savingsRate.rate.value,
        savingsRate.effectiveDate,
        savingsRate.updatedAt,
        savingsRate.id,
      ]
    );
  }
}
