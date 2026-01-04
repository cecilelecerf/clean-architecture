import { ActionPriceHistoryRepository } from "@application/ports/repositories/ActionPriceHistoryRepository";
import { ActionPriceHistoryEntity } from "@domain/entities/ActionPriceHistoryEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class ActionPriceHistoryRepositoryMySQL
  implements ActionPriceHistoryRepository
{
  constructor(private readonly client: MySQLClient) {}

  async save(history: ActionPriceHistoryEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO action_price_history (id, isin, date, price, volume, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        history.id,
        history.isin,
        history.date,
        history.price,
        history.volume,
        history.createdAt,
      ]
    );
  }

  async findByISIN(
    isin: string,
    now: Date,
    days: number = 30
  ): Promise<ActionPriceHistoryEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM action_price_history
       WHERE isin = ?
         AND date >= DATE_SUB(?, INTERVAL ? DAY)
       ORDER BY date ASC`,
      [isin, now, days]
    );
    return rows.map((row) =>
      ActionPriceHistoryEntity.from({
        id: row.id,
        isin: row.isin,
        date: new Date(row.date),
        price: Number(row.price),
        volume: Number(row.volume),
        createdAt: new Date(row.created_at),
      })
    );
  }

  async findByISINAndDateRange(
    isin: string,
    startDate: Date,
    endDate: Date
  ): Promise<ActionPriceHistoryEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM action_price_history
       WHERE isin = ?
         AND date >= ?
         AND date <= ?
       ORDER BY date ASC`,
      [isin, startDate, endDate]
    );

    return rows.map((row) =>
      ActionPriceHistoryEntity.from({
        id: row.id,
        isin: row.isin,
        date: new Date(row.date),
        price: Number(row.price),
        volume: Number(row.volume),
        createdAt: new Date(row.created_at),
      })
    );
  }

  async deleteByISIN(isin: string): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM action_price_history WHERE isin = ?",
      [isin]
    );
  }
  async findLastByISIN(isin: string): Promise<ActionPriceHistoryEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT *
     FROM action_price_history
     WHERE isin = ?
     ORDER BY date DESC
     LIMIT 1`,
      [isin]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return ActionPriceHistoryEntity.from({
      id: row.id,
      isin: row.isin,
      date: new Date(row.date),
      price: Number(row.price),
      volume: Number(row.volume),
      createdAt: new Date(row.created_at),
    });
  }
}
