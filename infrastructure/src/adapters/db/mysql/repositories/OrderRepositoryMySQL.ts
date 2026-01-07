import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  OrderEntityWithAccount,
  OrderRepository,
} from "@application/ports/repositories/OrderRepository";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Money } from "@domain/values/Money";
import { IBAN } from "@domain/values/IBAN";
import { AccountMapper } from "../../mappers/AccountMapper";
import { ISIN } from "@domain/values/ISIN";

export class OrderRepositoryMySQL implements OrderRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToOrder(row: RowDataPacket): OrderEntity {
    return OrderEntity.from({
      id: row.id,
      IBAN: IBAN.from(row.account_iban),
      ISIN: ISIN.from(row.action_isin),
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
        order.ISIN.getValue(),
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
  async findByIdWithAccount(
    id: OrderEntity["id"]
  ): Promise<OrderEntityWithAccount | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      o.*,
      a.iban as acc_iban,
      a.name as acc_name,
      a.type as acc_type,
      a.balance as acc_balance,
      a.color as acc_color,
      a.currency as acc_currency,
      a.created_at as acc_created_at,
      a.updated_at as acc_updated_at,
      a.user_id as acc_user_id
     FROM orders o
     LEFT JOIN accounts a ON o.account_iban = a.iban
     WHERE o.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const account = AccountMapper.mapRowToAccount(row, "acc_");
    const order = this.mapRowToOrder(row);
    return Object.assign(order, { account });
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
        order.ISIN.getValue(),
        order.type,
        order.quantity,
        order.price.amount,
        order.price.currency,
        order.date ?? null,
        order.status,
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
    const params: any[] = [actionId.getValue()];

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
  async findAllExecutedByISINAndDateRange(
    actionId: ActionEntity["ISIN"],
    startDate: Date,
    endDate: Date
  ): Promise<OrderEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM orders 
        WHERE action_isin = ? 
        AND date >= ?
        AND date <= ?
        AND status = "executed"
        ORDER BY date ASC`,
      [actionId.getValue(), startDate, endDate]
    );

    return rows.map((row) => this.mapRowToOrder(row));
  }

  async findAllByActionIdAndStatusAndUserId(
    actionId: ActionEntity["ISIN"],
    userId: UserEntity["id"],
    status?: OrderEntity["status"]
  ): Promise<OrderEntity[]> {
    const conditions = ["o.action_isin = ?", "a.user_id = ?"];
    const params: any[] = [actionId.getValue(), userId];
    if (status !== undefined) {
      conditions.push("o.status = ?");
      params.push(status);
    }

    const query = `SELECT o.* FROM orders o
                LEFT JOIN accounts a ON o.account_iban = a.iban
                 WHERE ${conditions.join(" AND ")} 
                 ORDER BY o.created_at ASC`;

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
      [actionId.getValue(), status, type]
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
      [actionId.getValue()]
    );

    return rows.map((row) => this.mapRowToOrder(row));
  }
}
