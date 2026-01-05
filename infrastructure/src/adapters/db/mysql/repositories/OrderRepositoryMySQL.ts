import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Money } from "@domain/values/Money";
import { IBAN } from "@domain/values/IBAN";

export class OrderRepositoryMySQL implements OrderRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToOrder(row: RowDataPacket): OrderEntity {
    console.log(row.price_amount);
    return OrderEntity.from({
      id: row.id,
      accountIban: IBAN.from(row.account_iban),
      actionId: row.action_id,
      type: row.type,
      quantity: row.quantity,
      price: Money.from({
        amount: row.price_amount,
        currency: row.price_currency,
      }),
      fee: Money.from({ amount: row.fee_amount, currency: row.fee_currency }),
      date: row.date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      transactionId: row.transaction_id,
    });
  }

  async save(order: OrderEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO orders 
       (id, account_iban, action_id, type, quantity, price_amount, price_currency, fee_amount, fee_currency,  date, status, created_at, updated_at, transaction_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.accountIban.value,
        order.actionId,
        order.type,
        order.quantity,
        order.price.amount,
        order.price.currency,
        order.fee.amount,
        order.fee.currency,
        order.date,
        order.status,
        order.createdAt,
        order.updatedAt,
        order.transactionId,
      ]
    );
  }

  async findById(id: OrderEntity["id"]): Promise<OrderEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return this.mapRowToOrder(row);
  }

  async findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE user_id = ?`,
      [userId]
    );
    return rows.map((row) => this.mapRowToOrder(row));
  }

  async findAllByActionId(
    actionId: ActionEntity["ISIN"]
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE action_id = ?`,
      [actionId]
    );
    return rows.map((row) => this.mapRowToOrder(row));
  }

  async findAllOpen(): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE status = 'pending'`
    );
    return rows.map((row) => this.mapRowToOrder(row));
  }

  async update(order: OrderEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE orders 
       SET account_iban = ?, action_id = ?, type = ?, quantity = ?, price_amount = ?, price_currency = ?, fee_amount = ?, fee_currency = ?, date = ?, status = ?, created_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        order.accountIban.value,
        order.actionId,
        order.type,
        order.quantity,
        order.price.amount,
        order.price.currency,
        order.fee.amount,
        order.fee.currency,
        order.date,
        order.status,
        order.id,
        order.createdAt,
        order.updatedAt,
      ]
    );
  }

  async delete(id: OrderEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM orders WHERE id = ?`,
      [id]
    );
  }

  async findAllByUserIdAndStatus(
    userId: UserEntity["id"],
    status: OrderEntity["status"]
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT o.* FROM orders o 
        LEFT JOIN accounts a ON o.account_iban = a.iban
        LEFT JOIN users u ON a.user_id = u.id 
      WHERE status = ? AND u.id = ?`,
      [status, userId]
    );
    console.log(rows);
    return rows.map((row) => this.mapRowToOrder(row));
  }
  async findAllByActionIdAndStatus(
    actionId: string,
    status: "pending" | "executed" | "cancelled"
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE action_id = ? AND status = ? ORDER BY created_at ASC",
      [actionId, status]
    );

    return rows.map((row) => this.mapRowToOrder(row));
  }
}
