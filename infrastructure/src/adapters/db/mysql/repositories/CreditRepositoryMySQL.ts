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
        a.role as account_role,
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
        a.role as account_role,
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

    const formule = row.form_id
      ? FormuleMapper.mapRowToFormule(row, "form_")
      : null;

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

  /** Crédits actifs */
  async findActiveCredits(today: Date): Promise<CreditEntityWithFormule[]> {
    const rows = await this.client.queryRows<RowDataPacket[]>(
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
      WHERE c.status = 'ACCEPTED'
        AND c.remaining_amount > 0
        AND c.start_date <= ?
      ORDER BY c.start_date DESC`,
      [today]
    );

    return rows.map((row: RowDataPacket) => {
      const credit = CreditMapper.mapRowToCredit(row);
      const formule = FormuleMapper.mapRowToFormule(row, "form_");
      return Object.assign(credit, { formule });
    });
  }

  /** Crédits en cours de traitement */
  async findPendingCredits(): Promise<CreditEntityWithFormule[]> {
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
      WHERE c.status = 'PENDING'
      ORDER BY c.start_date DESC`
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

  /** Supprimer un crédit */
  async delete(id: CreditEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM credits WHERE id = ?",
      [id]
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
}
