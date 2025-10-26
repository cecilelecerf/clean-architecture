import { MySQLClient } from "@adapters/db/MySQLClient";
import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { Percentage } from "@domain/values/Percentage";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class SavingsRateRepositoryMySQL implements SavingRateRepository {
  constructor(private readonly client: MySQLClient) {}

  async findAll(): Promise<SavingsRateEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM savings_rates`
    );
    return rows.map((row) =>
      SavingsRateEntity.from({
        id: row.id,
        rate: Percentage.from({ value: row.rate }),
        effectiveDate: row.effectiveDate,
      })
    );
  }

  async findById(
    id: SavingsRateEntity["id"]
  ): Promise<SavingsRateEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM savings_rates WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return SavingsRateEntity.from({
      id: row.id,
      rate: Percentage.from({ value: row.rate }),
      effectiveDate: row.effectiveDate,
    });
  }

  async save(savingsRate: SavingsRateEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO savings_rates (id, rate, effectiveDate) VALUES (?, ?, ?)`,
      [savingsRate.id, savingsRate.rate.value, savingsRate.effectiveDate]
    );
  }

  async update(savingsRate: SavingsRateEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE savings_rates SET rate = ?, effectiveDate = ? WHERE id = ?`,
      [savingsRate.rate.value, savingsRate.effectiveDate, savingsRate.id]
    );
  }
}
