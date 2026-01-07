import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  ActionRepository,
  ActionStatistics,
} from "@application/ports/repositories/ActionRepository";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { Money } from "@domain/values/Money";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { ISIN } from "@domain/values/ISIN";

export class ActionRepositoryMySQL implements ActionRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToAction(row: RowDataPacket): ActionEntity {
    const price = Money.create({
      amount: row.price,
      currency: row.currency,
    }) as Money;

    return ActionEntity.from({
      ISIN: ISIN.from(row.isin),
      name: row.name,
      symbol: row.symbol,
      market: row.market,
      activitySector: row.activity_sector,
      price,
      isAvailable: !!row.is_available,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      defaultQuantity: row.default_quantity,
    });
  }

  async save(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO actions 
        (isin, name, symbol, market, activity_sector, price, currency, is_available, created_at, updated_at, default_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        action.ISIN.getValue(),
        action.name,
        action.symbol,
        action.market,
        action.activitySector,
        action.price.amount,
        action.price.currency,
        action.isAvailable ? 1 : 0,
        action.createdAt,
        action.updatedAt,
        action.defaultQuantity,
      ]
    );
  }

  async findByISIN(ISIN: ActionEntity["ISIN"]): Promise<ActionEntity | null> {
    const [rows] = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE isin = ?`,
      [ISIN.getValue()]
    );

    if (!rows.length) return null;
    return this.mapRowToAction(rows[0]);
  }

  async findAll(): Promise<ActionEntity[]> {
    const [rows] = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions ORDER BY name ASC`
    );
    return rows.map(this.mapRowToAction.bind(this));
  }

  async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
    const [rows] = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE is_available = ? ORDER BY name ASC`,
      [isAvailable ? 1 : 0]
    );
    return rows.map(this.mapRowToAction.bind(this));
  }

  async setAvailability(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE actions SET is_available = ?, updated_at = ? WHERE isin = ?`,
      [
        action.isAvailable ? 1 : 0,
        action.updatedAt || new Date(),
        action.ISIN.getValue(),
      ]
    );
  }

  async update(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE actions 
       SET name = ?, symbol = ?, market = ?, activity_sector = ?, 
           price = ?, currency = ?, is_available = ?, updated_at = ?, default_quantity = ?
       WHERE isin = ?`,
      [
        action.name,
        action.symbol,
        action.market,
        action.activitySector,
        action.price.amount,
        action.price.currency,
        action.isAvailable ? 1 : 0,
        action.updatedAt || new Date(),
        action.defaultQuantity,
        action.ISIN.getValue(),
      ]
    );
  }

  async delete(ISIN: ActionEntity["ISIN"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM actions WHERE isin = ?`,
      [ISIN.getValue()]
    );
  }

  async getStatistics(
    isin: ActionEntity["ISIN"],
    now: Date
  ): Promise<ActionStatistics> {
    const IsinValue = isin.getValue();

    const [priceRows] = await this.client.query<RowDataPacket[]>(
      `SELECT price FROM actions WHERE isin = ?`,
      [IsinValue]
    );
    const price = Number(priceRows[0]?.price || 0);

    const [statsRows] = await this.client.query<RowDataPacket[]>(
      `SELECT 
        (SELECT price FROM action_price_history WHERE isin = ? AND date >= DATE_SUB(?, INTERVAL 1 DAY) ORDER BY date ASC LIMIT 1) as price24h,
        (SELECT price FROM action_price_history WHERE isin = ? AND date >= DATE_SUB(?, INTERVAL 7 DAY) ORDER BY date ASC LIMIT 1) as price7d,
        (SELECT price FROM action_price_history WHERE isin = ? AND date >= DATE_SUB(?, INTERVAL 30 DAY) ORDER BY date ASC LIMIT 1) as price30d,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        AVG(price) as averagePrice,
        SUM(volume) as totalVolume,
        COUNT(*) as transactionCount
      FROM action_price_history
      WHERE isin = ?
        AND date >= DATE_SUB(?, INTERVAL 30 DAY)`,
      [IsinValue, now, IsinValue, now, IsinValue, now, IsinValue, now]
    );

    const stats = statsRows[0];

    const price24h = Number(stats?.price24h ?? price);
    const price7d = Number(stats?.price7d ?? price);
    const price30d = Number(stats?.price30d ?? price);

    const change24h = price24h > 0 ? ((price - price24h) / price24h) * 100 : 0;
    const change7d = price7d > 0 ? ((price - price7d) / price7d) * 100 : 0;
    const change30d = price30d > 0 ? ((price - price30d) / price30d) * 100 : 0;

    return {
      priceChange: Math.round(change24h * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      change7d: Math.round(change7d * 100) / 100,
      change30d: Math.round(change30d * 100) / 100,
      minPrice: Math.round(Number(stats?.minPrice ?? price) * 100) / 100,
      maxPrice: Math.round(Number(stats?.maxPrice ?? price) * 100) / 100,
      averagePrice:
        Math.round(Number(stats?.averagePrice ?? price) * 100) / 100,
      totalVolume: Number(stats?.totalVolume ?? 0),
      transactionCount: Number(stats?.transactionCount ?? 0),
    };
  }
}
