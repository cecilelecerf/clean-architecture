import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export class CreditRepositoryMySQL implements CreditRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToCredit(row: RowDataPacket): CreditEntity {
    const initialAmount = Money.from({
      amount: row.initial_amount,
      currency: row.initial_currency,
    });
    const monthlyPayment = Money.from({
      amount: row.monthly_amount,
      currency: row.monthly_currency,
    });
    const remainingBalance = Money.from({
      amount: row.remaining_amount,
      currency: row.remaining_currency,
    });
    const interestRate = Percentage.from(row.interest_rate);
    const insuranceRate = Percentage.from(row.insurance_rate);

    return CreditEntity.from({
      id: row.id,
      userId: row.user_id,
      initialAmount,
      interestRate,
      insuranceRate,
      durationMonths: row.duration_months,
      startDate: row.start_date,
      monthlyPayment,
      remainingBalance,
      status: row.status,
      createdAt: row.created_at,
      advisorId: row.advisor_id,
      updatedAt: row.updated_at,
    });
  }

  /** Trouver un crédit par ID */
  async findById(id: CreditEntity["id"]): Promise<CreditEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM credits WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRowToCredit(rows[0]);
  }

  /** Tous les crédits d'un utilisateur */
  async findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM credits WHERE user_id = ? ORDER BY start_date DESC",
      [userId]
    );

    return rows.map((row) => this.mapRowToCredit(row));
  }

  /** Crédits actifs */
  async findActiveCredits(): Promise<CreditEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM credits WHERE remaining_amount > 0 ORDER BY start_date DESC"
    );

    return rows.map((row) => this.mapRowToCredit(row));
  }

  /** Sauvegarder un crédit */
  async save(credit: CreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO credits 
        (id, user_id, initial_amount, initial_currency, interest_rate, insurance_rate, 
         duration_months, start_date, monthly_amount, monthly_currency, 
         remaining_amount, remaining_currency, status, created_at, advisor_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        credit.id,
        credit.userId,
        credit.initialAmount.amount,
        credit.initialAmount.currency,
        credit.interestRate.value,
        credit.insuranceRate.value,
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
      ]
    );
  }

  /** Mettre à jour un crédit */
  async update(credit: CreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE credits
       SET user_id = ?, initial_amount = ?, initial_currency = ?, 
           interest_rate = ?, insurance_rate = ?, duration_months = ?, 
           start_date = ?, monthly_amount = ?, monthly_currency = ?, 
           remaining_amount = ?, remaining_currency = ?, status = ?, advisor_id = ?, updated_at = ? 
       WHERE id = ?`,
      [
        credit.userId,
        credit.initialAmount.amount,
        credit.initialAmount.currency,
        credit.interestRate.value,
        credit.insuranceRate.value,
        credit.durationMonths,
        credit.startDate,
        credit.monthlyPayment.amount,
        credit.monthlyPayment.currency,
        credit.remainingBalance.amount,
        credit.remainingBalance.currency,
        credit.status,
        credit.advisorId,
        credit.updatedAt,
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
}
