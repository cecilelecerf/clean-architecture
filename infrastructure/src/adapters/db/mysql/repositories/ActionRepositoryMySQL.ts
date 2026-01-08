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
    const price = Money.from({
      amount: row.price,
      currency: row.currency,
    }) as Money;
    console.log(row);
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
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE isin = ?`,
      [ISIN.getValue()]
    );

    if (!rows.length) return null;
    return this.mapRowToAction(rows[0]);
  }

  async findAll(): Promise<ActionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions ORDER BY name ASC`
    );
    return rows.map(this.mapRowToAction);
  }

  async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM actions WHERE is_available = ? ORDER BY name ASC`,
      [isAvailable ? 1 : 0]
    );
    return rows.map(this.mapRowToAction);
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
}
