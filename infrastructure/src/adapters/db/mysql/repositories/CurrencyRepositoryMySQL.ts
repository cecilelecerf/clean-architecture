import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import { CurrencyEntity } from "@domain/entities/CurrencyEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class CurrencyRepositoryMySQL implements CurrencyRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(currency: CurrencyEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO currencies (code, exchange_rate, created_at, updated_at) 
       VALUES (?, ?, ?, ?)`,
      [
        currency.code,
        currency.exchangeRate,
        currency.createdAt,
        currency.updatedAt || currency.createdAt,
      ]
    );
  }

  async update(currency: CurrencyEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE currencies 
       SET exchange_rate = ?, updated_at = ?
       WHERE code = ?`,
      [currency.exchangeRate, currency.updatedAt || new Date(), currency.code]
    );
  }

  async delete(code: string): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM currencies WHERE code = ?",
      [code.toUpperCase()]
    );
  }

  async findByCode(code: string): Promise<CurrencyEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM currencies WHERE code = ?",
      [code.toUpperCase()]
    );

    if (rows.length === 0) return null;

    return this.mapRowToEntity(rows[0]);
  }

  async findAll(): Promise<CurrencyEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM currencies ORDER BY code ASC"
    );

    return rows.map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: RowDataPacket): CurrencyEntity {
    return CurrencyEntity.from({
      code: row.code,
      exchangeRate: Number(row.exchange_rate),
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }
}
