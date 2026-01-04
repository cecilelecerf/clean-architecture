import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  ActionRepository,
  ActionStatistics,
} from "@application/ports/repositories/ActionRepository";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { Money } from "@domain/values/Money";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class ActionRepositoryMySQL implements ActionRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToAction(row: RowDataPacket): ActionEntity {
    const currentPrice = Money.from({
      amount: row.current_price,
      currency: row.currency,
    });

    return ActionEntity.from({
      ISIN: row.isin,
      name: row.name,
      totalNb: row.total_nb,
      symbol: row.symbol,
      market: row.market,
      activitySector: row.activity_sector,
      currentPrice,
      isAvailable: !!row.is_available,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /** Sauvegarder une action */
  async save(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO actions 
        (isin, name, total_nb, symbol, market, activity_sector, current_price, currency, is_available, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        action.ISIN,
        action.name,
        action.totalNb,
        action.symbol,
        action.market,
        action.activitySector,
        action.currentPrice.amount,
        action.currentPrice.currency,
        action.isAvailable ? 1 : 0,
        action.createdAt,
        action.updatedAt,
      ]
    );
  }

  /** Trouver une action par ISIN */
  async findByISIN(ISIN: ActionEntity["ISIN"]): Promise<ActionEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE isin = ?`,
      [ISIN]
    );

    if (rows.length === 0) return null;

    return this.mapRowToAction(rows[0]);
  }

  /** Toutes les actions */
  async findAll(): Promise<ActionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions ORDER BY name ASC`
    );

    return rows.map((row) => this.mapRowToAction(row));
  }

  /** Actions par disponibilité */
  async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE is_available = ? ORDER BY name ASC`,
      [isAvailable ? 1 : 0]
    );

    return rows.map((row) => this.mapRowToAction(row));
  }

  /** Modifier la disponibilité */
  async setAvailability(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE actions SET is_available = ?, updated_at = ? WHERE isin = ?`,
      [action.isAvailable ? 1 : 0, action.updatedAt || new Date(), action.ISIN]
    );
  }

  /** Mettre à jour une action */
  async update(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE actions 
       SET name = ?, total_nb = ?, symbol = ?, market = ?, activity_sector = ?, 
           current_price = ?, currency = ?, is_available = ?, updated_at = ? 
       WHERE isin = ?`,
      [
        action.name,
        action.totalNb,
        action.symbol,
        action.market,
        action.activitySector,
        action.currentPrice.amount,
        action.currentPrice.currency,
        action.isAvailable ? 1 : 0,
        action.updatedAt || new Date(),
        action.ISIN,
      ]
    );
  }

  /** Supprimer une action */
  async delete(ISIN: ActionEntity["ISIN"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM actions WHERE isin = ?`,
      [ISIN]
    );
  }

  async getStatistics(isin: string, now: Date): Promise<ActionStatistics> {
    const [currentPrice] = await this.client.query<RowDataPacket[]>(
      `SELECT current_price FROM actions WHERE ISIN = ?`,
      [isin]
    );

    const price = Number(currentPrice[0]?.current_price || 0);

    const stats = await this.client.query<RowDataPacket[]>(
      `SELECT 
        (SELECT price FROM action_price_history 
         WHERE isin = ? AND date >= DATE_SUB(?, INTERVAL 1 DAY) 
         ORDER BY date ASC LIMIT 1) as price24h,
        (SELECT price FROM action_price_history 
         WHERE isin = ? AND date >= DATE_SUB(?, INTERVAL 7 DAY) 
         ORDER BY date ASC LIMIT 1) as price7d,
        (SELECT price FROM action_price_history 
         WHERE isin = ? AND date >= DATE_SUB(?, INTERVAL 30 DAY) 
         ORDER BY date ASC LIMIT 1) as price30d,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        AVG(price) as averagePrice,
        SUM(volume) as totalVolume,
        COUNT(*) as transactionCount
      FROM action_price_history
      WHERE isin = ?
        AND date >= DATE_SUB(?, INTERVAL 30 DAY)`,
      [isin, now, isin, now, isin, now, isin, now]
    );

    const price24h = Number(stats[0]?.price24h || price);
    const price7d = Number(stats[0]?.price7d || price);
    const price30d = Number(stats[0]?.price30d || price);

    const change24h = price24h > 0 ? ((price - price24h) / price24h) * 100 : 0;
    const change7d = price7d > 0 ? ((price - price7d) / price7d) * 100 : 0;
    const change30d = price30d > 0 ? ((price - price30d) / price30d) * 100 : 0;
    const priceChange = change24h;

    return {
      priceChange: Math.round(priceChange * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      change7d: Math.round(change7d * 100) / 100,
      change30d: Math.round(change30d * 100) / 100,
      minPrice: Math.round(Number(stats[0]?.minPrice || price) * 100) / 100,
      maxPrice: Math.round(Number(stats[0]?.maxPrice || price) * 100) / 100,
      averagePrice:
        Math.round(Number(stats[0]?.averagePrice || price) * 100) / 100,
      totalVolume: Number(stats[0]?.totalVolume || 0),
      transactionCount: Number(stats[0]?.transactionCount || 0),
    };
  }
}
