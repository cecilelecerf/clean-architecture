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
    return OrderEntity.from({
      id: row.id,
      IBAN: IBAN.from(row.account_iban),
      ISIN: row.action_isin,
      type: row.type,
      quantity: row.quantity,
      price: Money.from({
        amount: row.price_amount,
        currency: row.price_currency,
      }),
      executionPrice: row.executionPrice
        ? Money.from({
            amount: row.execution_price_amount,
            currency: row.execution_price_currency,
          })
        : undefined,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      date: row.date ?? undefined,
      transactionId: row.transaction_id ?? undefined,
    });
  }

  async save(order: OrderEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO orders (
      id,
      account_iban,
      action_isin,
      type,
      quantity,
      price_amount,
      price_currency,
      execution_price_amount,
      execution_price_currency,
      date,
      status,
      created_at,
      updated_at,
      transaction_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.IBAN.value,
        order.ISIN,
        order.type,
        order.quantity,
        order.price.amount,
        order.price.currency,
        order.executionPrice ? order.executionPrice.amount : null,
        order.executionPrice ? order.executionPrice.currency : null,
        order.date ? order.date : null,
        order.status,
        order.createdAt,
        order.updatedAt,
        order.transactionId ?? null,
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
      `SELECT o.* FROM orders o 
       LEFT JOIN accounts a ON o.account_iban = a.iban
       WHERE a.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows.map((row) => this.mapRowToOrder(row));
  }

  async findAllOpen(): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at ASC`
    );
    return rows.map((row) => this.mapRowToOrder(row));
  }

  async update(order: OrderEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE orders 
       SET account_iban = ?, action_isin = ?, type = ?, quantity = ?, 
           price_amount = ?, price_currency = ?, date = ?, status = ?, created_at = ?, updated_at = ?, transaction_id = ?, execution_price_amount = ?, execution_price_currency = ?
       WHERE id = ?`,
      [
        order.IBAN.value,
        order.ISIN,
        order.type,
        order.quantity,
        order.price.amount,
        order.price.currency,
        order.date,
        order.status ?? null,
        order.createdAt,
        order.updatedAt,
        order.transactionId ?? null,
        order.executionPrice ? order.executionPrice.amount : null,
        order.executionPrice ? order.executionPrice.currency : null,
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

  async findAllByUserIdAndStatus(
    userId: UserEntity["id"],
    status: OrderEntity["status"]
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT o.* FROM orders o 
       LEFT JOIN accounts a ON o.account_iban = a.iban
       LEFT JOIN users u ON a.user_id = u.id 
       WHERE o.status = ? AND u.id = ?
       ORDER BY o.created_at ASC`,
      [status, userId]
    );
    return rows.map((row) => this.mapRowToOrder(row));
  }

  async findAllByActionIdAndStatus(
    actionId: ActionEntity["ISIN"],
    status?: OrderEntity["status"]
  ): Promise<OrderEntity[]> {
    const conditions = ["action_isin = ?"];
    const params: any[] = [actionId];

    if (status !== undefined) {
      conditions.push("status = ?");
      params.push(status);
    }

    const query = `SELECT * FROM orders 
                 WHERE ${conditions.join(" AND ")} 
                 ORDER BY created_at ASC`;

    const rows = await this.client.query<RowDataPacket[]>(query, params);

    return rows.map((row) => this.mapRowToOrder(row));
  }

  async findAllByActionIdAndStatusAndType(
    actionId: ActionEntity["ISIN"],
    status: OrderEntity["status"],
    type: OrderEntity["type"]
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders 
       WHERE action_isin = ? AND status = ? AND type = ?
       ORDER BY created_at ASC`,
      [actionId, status, type]
    );

    return rows.map((row) => this.mapRowToOrder(row));
  }

  async findPendingLimitOrders(
    actionId: ActionEntity["ISIN"]
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders 
       WHERE action_isin = ? AND status = 'pending' AND execution_type = 'limit'
       ORDER BY created_at ASC`,
      [actionId]
    );

    return rows.map((row) => this.mapRowToOrder(row));
  }
}
