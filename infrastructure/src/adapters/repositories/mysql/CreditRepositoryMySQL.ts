import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export class CreditRepositoryMySQL implements CreditRepository {
  constructor(private readonly client: MySQLClient) {}

  async findById(id: CreditEntity["id"]): Promise<CreditEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM credits WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];

    return CreditEntity.from({
      id: row.id,
      userId: row.userId,
      initialAmount: Money.from({
        amount: row.initialAmount,
        currency: row.initialCurrency,
      }),
      interestRate: Percentage.from({ value: row.interestRate }),
      insuranceRate: Percentage.from({ value: row.insuranceRate }),
      durationMonths: row.durationMonths,
      startDate: row.startDate,
      monthlyPayment: Money.from({
        amount: row.monthlyAmount,
        currency: row.monthlyCurrency,
      }),
      remainingBalance: Money.from({
        amount: row.remainingAmount,
        currency: row.remainingCurrency,
      }),
    });
  }

  async findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM credits WHERE user_id = ?",
      [userId]
    );
    return rows.map((row) =>
      CreditEntity.from({
        id: row.id,
        userId: row.userId,
        initialAmount: Money.from({
          amount: row.initialAmount,
          currency: row.initialCurrency,
        }),
        interestRate: Percentage.from({ value: row.interestRate }),
        insuranceRate: Percentage.from({ value: row.insuranceRate }),
        durationMonths: row.durationMonths,
        startDate: row.startDate,
        monthlyPayment: Money.from({
          amount: row.monthlyAmount,
          currency: row.monthlyCurrency,
        }),
        remainingBalance: Money.from({
          amount: row.remainingAmount,
          currency: row.remainingCurrency,
        }),
      })
    );
  }

  async findActiveCredits(): Promise<CreditEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM credits WHERE remaining_amount > 0"
    );
    return rows.map((row) =>
      CreditEntity.from({
        id: row.id,
        userId: row.userId,
        initialAmount: Money.from({
          amount: row.initialAmount,
          currency: row.initialCurrency,
        }),
        interestRate: Percentage.from({ value: row.interestRate }),
        insuranceRate: Percentage.from({ value: row.insuranceRate }),
        durationMonths: row.durationMonths,
        startDate: row.startDate,
        monthlyPayment: Money.from({
          amount: row.monthlyAmount,
          currency: row.monthlyCurrency,
        }),
        remainingBalance: Money.from({
          amount: row.remainingAmount,
          currency: row.remainingCurrency,
        }),
      })
    );
  }

  async save(credit: CreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO credits 
        (id, user_id, initial_amount, initial_currency, interest_rate, insurance_rate, duration_months, start_date, monthly_amount, monthly_currency, remaining_amount, remaining_currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );
  }

  async update(credit: CreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE credits
       SET user_id = ?, initial_amount = ?, initial_currency = ?, interest_rate = ?, insurance_rate = ?, duration_months = ?, start_date = ?, monthly_amount = ?, monthly_currency = ?, remaining_amount = ?, remaining_currency = ?
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
        credit.id,
      ]
    );
  }

  async delete(id: CreditEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(
      "DELETE FROM credits WHERE id = ?",
      [id]
    );
  }
}
