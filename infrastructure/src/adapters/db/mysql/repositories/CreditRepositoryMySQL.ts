import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  CreditEntityWithFormule,
  CreditEntityWithFormuleAndAccount,
  CreditEntityWithFormuleAndAdvisor,
  CreditRepository,
} from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { AccountMapper } from "../../mappers/AccountMapper";
import { UserMapper } from "../../mappers/UserMapper";
import { FormuleMapper } from "../../mappers/FormuleMapper";
import { CreditMapper } from "../../mappers/CreditMapper";
import { AccountEntityWithUser } from "@application/ports/repositories/AccountRepository";
import { IBAN } from "@domain/values/IBAN";
import { TransactionMapper } from "../../mappers/TransactionMapper";
import { UserEntity } from "@domain/entities/UserEntity";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";

export class CreditRepositoryMySQL implements CreditRepository {
  constructor(private readonly client: MySQLClient) {}

  /** Trouver un crédit par ID */
  async findById(
    id: CreditEntity["id"]
  ): Promise<CreditEntityWithFormuleAndAdvisor | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      c.*,
      f.id as form_id,
      f.interest_rate as form_interest_rate,
      f.insurance_rate as form_insurance_rate,
      f.type as form_type,
      f.label as form_label,
      f.description as form_description,
      f.is_active as form_is_active,
      f.account_id as form_account_id,
      f.created_at as form_created_at,
      f.min_amount as form_min_amount,
      f.max_amount as form_max_amount,
      f.currency as form_currency,
      f.updated_at as form_updated_at,

        u.id as user_id,
        u.email as user_email,
        u.password_hash as user_password_hash,
        u.firstname as user_firstname,
        u.lastname as user_lastname,
        u.role as user_role,
        u.is_active as user_is_active,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at,
        u.confirmed_at as user_confirmed_at,

        a.iban as account_iban,
        a.name as account_name,
        a.type as account_type,
        a.balance as account_balance,
        a.color as account_color,
        a.currency as account_currency,
        a.created_at as account_created_at,
        a.updated_at as account_updated_at,
        a.user_id as account_user_id,

        t.id as transaction_id,
        t.label as transaction_label,
        t.icon as transaction_icon,
        t.from_account_id as transaction_from_account_id,
        t.to_account_id as transaction_to_account_id,
        t.amount as transaction_amount,
        t.currency as transaction_currency,
        t.date as transaction_date
      FROM credits c
      LEFT JOIN formules f ON c.formule_id = f.id
      LEFT JOIN users u ON c.advisor_id = u.id
      LEFT JOIN accounts a ON c.account_id = a.iban
      LEFT JOIN transactions t
        ON t.from_account_id = c.account_id
      AND t.to_account_id   = f.account_id
      WHERE c.id = ?
      ORDER BY t.date ASC`,
      [id]
    );
    if (rows.length === 0) return null;

    const row = rows[0];
    const credit = CreditMapper.mapRowToCredit(row);

    const formule = FormuleMapper.mapRowToFormule(row, "form_");

    const advisor = row.user_id ? UserMapper.mapRowToUser(row, "user_") : null;

    const account = AccountMapper.mapRowToAccount(row, "account_");
    const transactions = rows
      .filter((row) => row.transaction_id !== null)
      .map((row) => TransactionMapper.mapRowToTransaction(row, "transaction_"));

    return Object.assign(credit, {
      advisor,
      account,
      formule,
      transactions,
    }) as CreditEntityWithFormuleAndAdvisor;
  }

  /** Trouver un crédit par ID avec les détails du comptes, de l'utilisateur du compte ainsi que de la formule du crédit*/
  async findByIdWithDetails(
    id: CreditEntity["id"]
  ): Promise<CreditEntityWithFormuleAndAccount | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        c.*,

        f.id as form_id,
        f.interest_rate as form_interest_rate,
        f.insurance_rate as form_insurance_rate,
        f.type as form_type,
        f.label as form_label,
        f.description as form_description,
        f.is_active as form_is_active,
        f.account_id as form_account_id,
        f.created_at as form_created_at,
        f.min_amount as form_min_amount,
        f.max_amount as form_max_amount,
        f.currency as form_currency,
        f.updated_at as form_updated_at,

        a.iban as account_iban, 
        a.name as account_name,
        a.type as account_type,
        a.balance as account_balance,
        a.color as account_color,
        a.currency as account_currency,
        a.created_at as account_created_at,
        a.updated_at as account_updated_at,
        a.user_id as account_user_id,

        u.id as user_id,
        u.email as user_email,
        u.password_hash as user_password_hash,
        u.firstname as user_firstname,
        u.lastname as user_lastname,
        u.role as user_role,
        u.is_active as user_is_active,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at,
        u.confirmed_at as user_confirmed_at
      FROM credits c
      LEFT JOIN formules f ON c.formule_id = f.id
      LEFT JOIN accounts a ON c.account_id = a.iban
      LEFT JOIN users u ON a.user_id = u.id
      WHERE c.id = '${id}'`
    );

    if (rows.length === 0) return null;

    const row = rows[0];

    const credit = CreditMapper.mapRowToCredit(row);

    let account: AccountEntityWithUser | null = null;
    if (row.account_iban) {
      const baseAccount = AccountMapper.mapRowToAccount(row, "account_");
      const user = UserMapper.mapRowToUser(row, "user_");

      (baseAccount as AccountEntityWithUser).user = user;
      account = baseAccount as AccountEntityWithUser;
    }

    const formule = FormuleMapper.mapRowToFormule(row, "form_");
    return Object.assign(credit, {
      account,
      formule,
    }) as CreditEntityWithFormuleAndAccount;
  }

  /** Tous les crédits d'un compte */
  async findAllByAccountIban(
    accountId: IBAN
  ): Promise<CreditEntityWithFormule[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        f.id as form_id,
        f.interest_rate as form_interest_rate,
        f.insurance_rate as form_insurance_rate,
        f.type as form_type,
        f.label as form_label,
        f.description as form_description,
        f.is_active as form_is_active,
        f.account_id as form_account_id,
        f.created_at as form_created_at,
        f.min_amount as form_min_amount,
        f.max_amount as form_max_amount,
        f.currency as form_currency,
        f.updated_at as form_updated_at
      FROM credits c
      LEFT JOIN formules f ON c.formule_id = f.id
      WHERE c.account_id = ?
      ORDER BY c.start_date DESC`,
      [accountId.value.toString()]
    );

    return rows.map((row: RowDataPacket) => {
      const credit = CreditMapper.mapRowToCredit(row);
      const formule = FormuleMapper.mapRowToFormule(row, "form_");
      return Object.assign(credit, { formule });
    });
  }

  /** Crédits par le status */
  async findAllByStatus(
    status?: CreditEntity["status"]
  ): Promise<CreditEntityWithFormule[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      c.*,
      f.id as form_id,
      f.interest_rate as form_interest_rate,
      f.insurance_rate as form_insurance_rate,
      f.type as form_type,
      f.label as form_label,
      f.description as form_description,
      f.is_active as form_is_active,
      f.account_id as form_account_id,
      f.created_at as form_created_at,
      f.min_amount as form_min_amount,
      f.max_amount as form_max_amount,
      f.currency as form_currency,
      f.updated_at as form_updated_at
    FROM credits c
    LEFT JOIN formules f ON c.formule_id = f.id
    ${status ? "WHERE c.status = ?" : ""}
    ORDER BY c.start_date DESC`,
      status ? [status] : []
    );

    return rows.map((row) => {
      const credit = CreditMapper.mapRowToCredit(row);
      const formule = FormuleMapper.mapRowToFormule(row, "form_");
      return Object.assign(credit, { formule });
    });
  }

  /** Sauvegarder un crédit */
  async save(credit: CreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO credits 
        (id, account_id, formule_id, initial_amount, initial_currency, 
         duration_months, start_date, monthly_amount, monthly_currency, 
         remaining_amount, remaining_currency, status, created_at, advisor_id, updated_at, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        credit.id,
        credit.accountId.value,
        credit.formuleCreditId,
        credit.initialAmount.amount,
        credit.initialAmount.currency,
        credit.durationMonths,
        credit.startDate,
        credit.monthlyPayment.amount,
        credit.monthlyPayment.currency,
        credit.remainingBalance.amount,
        credit.remainingBalance.currency,
        credit.status,
        credit.createdAt,
        credit.advisorId,
        credit.updatedAt,
        credit.reason ?? null,
      ]
    );
  }

  /** Mettre à jour un crédit */
  async update(credit: CreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE credits
       SET account_id = ?, formule_id = ?, initial_amount = ?, initial_currency = ?,  duration_months = ?, 
           start_date = ?, monthly_amount = ?, monthly_currency = ?, 
           remaining_amount = ?, remaining_currency = ?, status = ?, advisor_id = ?, updated_at = ?, reason = ?
       WHERE id = ?`,
      [
        credit.accountId.value,
        credit.formuleCreditId,
        credit.initialAmount.amount,
        credit.initialAmount.currency,
        credit.durationMonths,
        credit.startDate,
        credit.monthlyPayment.amount,
        credit.monthlyPayment.currency,
        credit.remainingBalance.amount,
        credit.remainingBalance.currency,
        credit.status,
        credit.advisorId,
        credit.updatedAt,
        credit.reason ?? null,
        credit.id,
      ]
    );
  }

  async findAllByUserId(
    userId: UserEntity["id"]
  ): Promise<CreditEntityWithFormule[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      c.*,
      f.id as form_id,
      f.interest_rate as form_interest_rate,
      f.insurance_rate as form_insurance_rate,
      f.type as form_type,
      f.label as form_label,
      f.description as form_description,
      f.is_active as form_is_active,
      f.account_id as form_account_id,
      f.created_at as form_created_at,
      f.min_amount as form_min_amount,
      f.max_amount as form_max_amount,
      f.currency as form_currency,
      f.updated_at as form_updated_at
    FROM credits c
    LEFT JOIN formules f ON c.formule_id = f.id
    INNER JOIN accounts a ON c.account_id = a.iban
    WHERE a.user_id = ?
    ORDER BY c.start_date DESC`,
      [userId]
    );

    return rows.map((row: RowDataPacket) => {
      const credit = CreditMapper.mapRowToCredit(row);
      const formule = FormuleMapper.mapRowToFormule(row, "form_");
      return Object.assign(credit, { formule });
    });
  }

  async findAllByFormuleId(
    formuleId: FormuleCreditEntity["id"]
  ): Promise<CreditEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      c.*  FROM credits c
      LEFT JOIN formules f ON c.formule_id = f.id 
      WHERE f.id = ?
      ORDER BY c.updated_at ASC`,
      [formuleId]
    );
    return rows.map((row: RowDataPacket) => CreditMapper.mapRowToCredit(row));
  }

  async countAcceptedByAdvisor(advisorId: string): Promise<number> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      COUNT(id) as count
      FROM credits 
      WHERE advisor_id = ? AND status IN ('ACCEPTED', 'COMPLETED')`,
      [advisorId]
    );
    return rows[0].count;
  }
  async countRefusedByAdvisor(advisorId: string): Promise<number> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
      COUNT(id) as count
      FROM credits 
      WHERE advisor_id = ? AND status = 'REFUSED'`,
      [advisorId]
    );
    return rows[0].count;
  }

  async countByFormule(formuleId: string): Promise<number> {
    const result = await this.client.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM credits 
       WHERE formule_id = ?`,
      [formuleId]
    );
    return result[0]?.count || 0;
  }

  async countByFormuleAndStatus(
    formuleId: string,
    status: CreditEntity["status"]
  ): Promise<number> {
    const result = await this.client.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM credits 
       WHERE formule_id = ? AND status = ?`,
      [formuleId, status]
    );
    return result[0]?.count || 0;
  }

  async countClientsByFormule(formuleId: string): Promise<number> {
    const result = await this.client.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT account_id) as count 
       FROM credits 
       WHERE formule_id = ?`,
      [formuleId]
    );
    return result[0]?.count || 0;
  }

  async getFinancialStatsByFormule(formuleId: string): Promise<{
    totalLoanedAmount: number;
    totalInterestEarned: number;
    totalInsuranceEarned: number;
    totalRevenue: number;
  }> {
    const result = await this.client.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(c.remaining_amount), 0) as totalLoanedAmount,
        COALESCE(SUM(
          c.remaining_amount * (f.interest_rate / 100 / 12) * c.duration_months
        ), 0) as totalInterestEarned,
        COALESCE(SUM(
          c.remaining_amount * (f.insurance_rate / 100 / 12) * c.duration_months
        ), 0) as totalInsuranceEarned
      FROM credits c
      INNER JOIN formules f ON c.formule_id = f.id
      WHERE c.formule_id = ?
        AND c.status IN ('COMPLETED', 'ACCEPTED')`,
      [formuleId]
    );

    if (!result || result.length === 0) {
      return {
        totalLoanedAmount: 0,
        totalInterestEarned: 0,
        totalInsuranceEarned: 0,
        totalRevenue: 0,
      };
    }

    const stats = result[0];
    const totalRevenue =
      Number(stats.totalInterestEarned) + Number(stats.totalInsuranceEarned);

    return {
      totalLoanedAmount:
        Math.round(Number(stats.totalLoanedAmount) * 100) / 100,
      totalInterestEarned:
        Math.round(Number(stats.totalInterestEarned) * 100) / 100,
      totalInsuranceEarned:
        Math.round(Number(stats.totalInsuranceEarned) * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }
}
