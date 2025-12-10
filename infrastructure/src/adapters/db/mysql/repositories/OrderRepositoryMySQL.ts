import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Money } from "@domain/values/Money";

export class OrderRepositoryMySQL implements OrderRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(order: OrderEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO orders 
       (id, user_id, action_id, type, quantity, price_amount, price_currency, fee_amount, fee_currency, order_date, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.userId,
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
        order.updatedAt ?? null
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
    return OrderEntity.from({
      id: row.id,
      userId: row.userId,
      actionId: row.actionId,
      type: row.type,
      quantity: row.quantity,
      price: Money.from({
        amount: row.priceAmount,
        currency: row.priceCurrency,
      }),
      fee: Money.from({ amount: row.feeAmount, currency: row.feeCurrency }),
      date: row.date,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null
    });
  }

  async findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE user_id = ?`,
      [userId]
    );
    return rows.map((row) =>
      OrderEntity.from({
        id: row.id,
        userId: row.userId,
        actionId: row.actionId,
        type: row.type,
        quantity: row.quantity,
        price: Money.from({
          amount: row.priceAmount,
          currency: row.priceCurrency,
        }),
        fee: Money.from({ amount: row.feeAmount, currency: row.feeCurrency }),
        date: row.date,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null
      })
    );
  }

  async findAllByActionId(
    actionId: ActionEntity["ISIN"]
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE action_id = ?`,
      [actionId]
    );
    return rows.map((row) =>
      OrderEntity.from({
        id: row.id,
        userId: row.userId,
        actionId: row.actionId,
        type: row.type,
        quantity: row.quantity,
        price: Money.from({
          amount: row.priceAmount,
          currency: row.priceCurrency,
        }),
        fee: Money.from({ amount: row.feeAmount, currency: row.feeCurrency }),
        date: row.date,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null
      })
    );
  }

  async findAllOpen(): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE status = 'pending'`
    );
    return rows.map((row) =>
      OrderEntity.from({
        id: row.id,
        userId: row.userId,
        actionId: row.actionId,
        type: row.type,
        quantity: row.quantity,
        price: Money.from({
          amount: row.priceAmount,
          currency: row.priceCurrency,
        }),
        fee: Money.from({ amount: row.feeAmount, currency: row.feeCurrency }),
        date: row.date,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null
      })
    );
  }

  async update(order: OrderEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE orders 
       SET user_id = ?, action_id = ?, type = ?, quantity = ?, price_amount = ?, price_currency = ?, fee_amount = ?, fee_currency = ?, order_date = ?, status = ?, created_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        order.userId,
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
        order.updatedAt || new Date()
      ]
    );
  }

  async delete(id: OrderEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `DELETE FROM orders WHERE id = ?`,
      [id]
    );
  }
}
