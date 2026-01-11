import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  TransactionEntityWithAccountWithUser,
  TransactionRepository,
} from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { AccountMapper } from "../../mappers/AccountMapper";
import { UserMapper } from "../../mappers/UserMapper";
import { TransactionFilters } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";

export class TransactionRepositoryMySQL implements TransactionRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToTransaction(row: RowDataPacket): TransactionEntity {
    const fromAccountId = IBAN.from(row.from_account_id);
    const toAccountId = IBAN.from(row.to_account_id);
    const amount = Money.from({ amount: row.amount, currency: row.currency });

    return TransactionEntity.from({
      id: row.id,
      fromAccountId,
      toAccountId,
      amount,
      label: row.label,
      icon: row.icon,
      date: row.date,
    });
  }

  async findById(
    id: TransactionEntity["id"]
  ): Promise<TransactionEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM transactions WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;
    return this.mapRowToTransaction(rows[0]);
  }

  async save(transaction: TransactionEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `
      INSERT INTO transactions (
        id,
        label,
        icon,
        from_account_id,
        to_account_id,
        amount,
        currency,
        date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        transaction.id,
        transaction.label,
        transaction.icon,
        transaction.fromAccountId.value,
        transaction.toAccountId.value,
        transaction.amount.amount,
        transaction.amount.currency,
        transaction.date,
      ]
    );
  }

  async findByIdWithAccountWithUser(
    id: TransactionEntity["id"]
  ): Promise<TransactionEntityWithAccountWithUser | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `
      SELECT 
        t.*,
        from_acc.iban as from_iban,
        from_acc.user_id as from_user_id,
        from_acc.name as from_name,
        from_acc.type as from_type,
        from_acc.color as from_color,
        from_acc.balance as from_balance,
        from_acc.currency as from_currency,
        from_acc.created_at as from_created_at,
        from_acc.updated_at as from_updated_at,
        to_acc.iban as to_iban,
        to_acc.user_id as to_user_id,
        to_acc.name as to_name,
        to_acc.type as to_type,
        to_acc.color as to_color,
        to_acc.balance as to_balance,
        to_acc.currency as to_currency,
        to_acc.created_at as to_created_at,
        to_acc.updated_at as to_updated_at,
        from_user.id as from_user_id_full,
        from_user.email as from_user_email,
        from_user.password_hash as from_user_password_hash,
        from_user.firstname as from_user_firstname,
        from_user.lastname as from_user_lastname,
        from_user.role as from_user_role,
        from_user.is_active as from_user_is_active,
        from_user.created_at as from_user_created_at,
        from_user.updated_at as from_user_updated_at,
        from_user.confirmed_at as from_user_confirmed_at,
        to_user.id as to_user_id_full,
        to_user.email as to_user_email,
        to_user.password_hash as to_user_password_hash,
        to_user.firstname as to_user_firstname,
        to_user.lastname as to_user_lastname,
        to_user.role as to_user_role,
        to_user.is_active as to_user_is_active,
        to_user.created_at as to_user_created_at,
        to_user.updated_at as to_user_updated_at,
        to_user.confirmed_at as to_user_confirmed_at
      FROM transactions t
      INNER JOIN accounts from_acc ON t.from_account_id = from_acc.iban
      INNER JOIN accounts to_acc ON t.to_account_id = to_acc.iban
      LEFT JOIN users from_user ON from_acc.user_id = from_user.id
      LEFT JOIN users to_user ON to_acc.user_id = to_user.id
      WHERE t.id = ?
      `,
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const fromAccount = AccountMapper.mapRowToAccount(row, "from_");
    const toAccount = AccountMapper.mapRowToAccount(row, "to_");
    const fromUser = UserMapper.mapRowToUser(row, "from_user_");
    const toUser = UserMapper.mapRowToUser(row, "to_user_");
    const fromAccountWithUser = Object.assign(fromAccount, { user: fromUser });
    const toAccountWithUser = Object.assign(toAccount, { user: toUser });
    const transaction = this.mapRowToTransaction(row);

    return Object.assign(transaction, {
      fromAccount: fromAccountWithUser,
      toAccount: toAccountWithUser,
    });
  }

  async findAllByAccountWithFilters(
    iban: IBAN,
    filters?: TransactionFilters
  ): Promise<{ transactions: TransactionEntity[]; total: number }> {
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters?.type) {
      if (filters.type === "debit") {
        whereClauses.push("from_account_id = ?");
        params.push(iban.value);
      } else if (filters.type === "credit") {
        whereClauses.push("to_account_id = ?");
        params.push(iban.value);
      }
    } else {
      whereClauses.push("(from_account_id = ? OR to_account_id = ?)");
      params.push(iban.value, iban.value);
    }

    if (filters?.label) {
      whereClauses.push("label LIKE ?");
      params.push(`%${filters.label}%`);
    }

    if (filters?.fromDate) {
      whereClauses.push("date >= ?");
      params.push(filters.fromDate);
    }

    if (filters?.toDate) {
      whereClauses.push("date <= ?");
      params.push(filters.toDate);
    }

    const whereSQL =
      whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

    const countRows = await this.client.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM transactions WHERE ${whereSQL}`,
      params
    );
    const total = Number(countRows[0]?.total ?? 0);

    const page = Math.max(1, parseInt(String(filters?.page ?? 1), 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(String(filters?.limit ?? 20), 10))
    );
    const offset = (page - 1) * limit;

    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM transactions WHERE ${whereSQL} ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const transactions = rows.map((row) => this.mapRowToTransaction(row));
    return { transactions, total };
  }
}
