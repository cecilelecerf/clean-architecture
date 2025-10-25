import { MySQLClient } from "@adapters/db/MySQLClient";
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
       (id, userId, actionId, type, quantity, priceAmount, priceCurrency, feeCurrency, feeAmount, date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    });
  }

  async findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE userId = ?`,
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
      })
    );
  }

  async findAllByActionId(
    actionId: ActionEntity["ISIN"]
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE actionId = ?`,
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
      })
    );
  }

  async update(order: OrderEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE orders 
       SET userId = ?, actionId = ?, type = ?, quantity = ?, priceAmount = ?, priceCurrency = ?, feeAmount = ?, feeCurrency = ?, date = ?, status = ? 
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
