import { MySQLClient } from "@adapters/db/MySQLClient";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { Money } from "@domain/values/Money";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class ActionRepositoryMySQL implements ActionRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO actions 
        (ISIN, name, symbol, market, activitySector, currentPrice, currency, isAvailable, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        action.ISIN,
        action.name,
        action.symbol,
        action.market,
        action.activitySector,
        action.currentPrice.amount,
        action.currentPrice.currency,
        action.isAvailable ? 1 : 0,
        action.createdAt,
        action.updatedAt || null,
      ]
    );
  }

  async findById(ISIN: ActionEntity["ISIN"]): Promise<ActionEntity | null> {
    const [rows] = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE ISIN = ?`,
      [ISIN]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return ActionEntity.from({
      ISIN: row.ISIN,
      name: row.name,
      symbol: row.symbol,
      market: row.market,
      activitySector: row.activitySector,
      currentPrice: Money.from({
        amount: row.currentPrice,
        currency: row.currency,
      }),
      isAvailable: !!row.isAvailable,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findAll(): Promise<ActionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions`
    );
    return rows.map((row) =>
      ActionEntity.from({
        ISIN: row.ISIN,
        name: row.name,
        symbol: row.symbol,
        market: row.market,
        activitySector: row.activitySector,

        currentPrice: Money.from({
          amount: row.currentPrice,
          currency: row.currency,
        }),
        isAvailable: !!row.isAvailable,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE isAvailable = ?`,
      [isAvailable ? 1 : 0]
    );
    return rows.map((row) =>
      ActionEntity.from({
        ISIN: row.ISIN,
        name: row.name,
        symbol: row.symbol,
        market: row.market,
        activitySector: row.activitySector,
        currentPrice: Money.from({
          amount: row.currentPrice,
          currency: row.currency,
        }),
        isAvailable: !!row.isAvailable,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  async setAvailability(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE actions SET isAvailable = ?, updatedAt = ? WHERE ISIN = ?`,
      [action.isAvailable ? 1 : 0, action.updatedAt || new Date(), action.ISIN]
    );
  }

  async update(action: ActionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE actions 
       SET name = ?, symbol = ?, market = ?, activitySector = ?, currentPrice = ?, currency = ?, isAvailable = ?, updatedAt = ? 
       WHERE ISIN = ?`,
      [
        action.name,
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

  async delete(ISIN: ActionEntity["ISIN"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM actions WHERE ISIN = ?`,
      [ISIN]
    );
  }
}
