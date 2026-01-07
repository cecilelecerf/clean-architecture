import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { FormuleType } from "@domain/values/FormuleType";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";
import { RowDataPacket } from "mysql2";

export class FormuleMapper {
  static mapRowToFormule(
    row: RowDataPacket,
    prefix: string = ""
  ): FormuleCreditEntity {
    const interestRate = Percentage.from({
      value: row[`${prefix}interest_rate`],
    });
    const insuranceRate = Percentage.from({
      value: row[`${prefix}insurance_rate`],
    });

    const minAmount =
      row[`${prefix}min_amount`] != null && row[`${prefix}currency`]
        ? Money.from({
            amount: row[`${prefix}min_amount`],
            currency: row[`${prefix}currency`],
          })
        : undefined;

    const maxAmount =
      row[`${prefix}max_amount`] != null && row[`${prefix}currency`]
        ? Money.from({
            amount: row[`${prefix}max_amount`],
            currency: row[`${prefix}currency`],
          })
        : undefined;

    const iban = IBAN.from(row[`${prefix}account_id`]);
    const type = FormuleType.from(row[`${prefix}type`]);
    return FormuleCreditEntity.from({
      id: row[`${prefix}id`],
      interestRate,
      insuranceRate,
      type,
      label: row[`${prefix}label`],
      description: row[`${prefix}description`],
      isActive: row[`${prefix}is_active`] === 1,
      accountId: iban,
      createdAt: row[`${prefix}created_at`],
      minAmount,
      maxAmount,
      currency: row[`${prefix}currency`],
      updatedAt: row[`${prefix}updated_at`],
    });
  }

  static mapDocToFormule(doc: any): FormuleCreditEntity {
    const interestRate = Percentage.from({ value: doc.interestRate });
    const insuranceRate = Percentage.from({ value: doc.insuranceRate });

    const minAmount =
      doc.minAmount != null && doc.currency
        ? Money.from({
            amount: doc.minAmount.amount,
            currency: doc.minAmount.currency,
          })
        : undefined;

    const maxAmount =
      doc.maxAmount != null && doc.currency
        ? Money.from({
            amount: doc.maxAmount.amount,
            currency: doc.maxAmount.currency,
          })
        : undefined;

    return FormuleCreditEntity.from({
      id: doc._id.toString(),
      interestRate,
      insuranceRate,
      type: FormuleType.from(doc.type),
      label: doc.label,
      description: doc.description,
      isActive: doc.isActive,
      accountId: IBAN.from(doc.accountId),
      createdAt: doc.createdAt,
      minAmount,
      maxAmount,
      currency: doc.currency,
      updatedAt: doc.updatedAt,
    });
  }
}
