import { CreditEntity } from "@domain/entities/CreditEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { RowDataPacket } from "mysql2";

export class CreditMapper {
  static mapRowToCredit(row: RowDataPacket, prefix: string = ""): CreditEntity {
    const initialAmount = Money.from({
      amount: Number(row[`${prefix}initial_amount`]),
      currency: row[`${prefix}initial_currency`],
    });
    const monthlyPayment = Money.from({
      amount: Number(row[`${prefix}monthly_amount`]),
      currency: row[`${prefix}initial_currency`],
    });
    const remainingBalance = Money.from({
      amount: Number(row[`${prefix}remaining_amount`]),
      currency: row[`${prefix}initial_currency`],
    });
    const accountId = IBAN.from(row[`${prefix}account_id`]);

    return CreditEntity.from({
      id: row[`${prefix}id`],
      accountId,
      formuleCreditId: row[`${prefix}formule_id`],
      initialAmount,
      durationMonths: row[`${prefix}duration_months`],
      startDate: row[`${prefix}start_date`],
      monthlyPayment,
      remainingBalance,
      status: row.status,
      createdAt: row[`${prefix}created_at`],
      advisorId: row[`${prefix}advisor_id`],
      updatedAt: row[`${prefix}updated_at`],
      reason: row[`${prefix}reason`],
    });
  }

  static mapDocToCredit(doc: any) {
    const initialAmount = Money.from(doc.initialAmount);
    const monthlyPayment = Money.from(doc.monthlyPayment);
    const remainingBalance = Money.from(doc.remainingBalance);
    const formuleCreditId = doc.formuleCreditId._id
      ? doc.formuleCreditId._id.toString()
      : doc.formuleCreditId.toString();
    const accountId = doc.accountId._id
      ? doc.accountId._id.toString()
      : doc.accountId.toString();
    return CreditEntity.from({
      id: doc._id.toString(),
      accountId: IBAN.from(accountId),
      formuleCreditId: formuleCreditId,
      initialAmount,
      durationMonths: doc.durationMonths,
      startDate: doc.startDate,
      monthlyPayment,
      remainingBalance,
      status: doc.status,
      createdAt: doc.createdAt,
      advisorId: doc.advisorId,
      updatedAt: doc.updatedAt,
      reason: doc.reason,
    });
  }
}
