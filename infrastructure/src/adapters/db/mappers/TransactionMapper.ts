import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { RowDataPacket } from "mysql2";

export class TransactionMapper {
  static mapRowToTransaction(
    row: RowDataPacket,
    prefix: string = ""
  ): TransactionEntity {
    const fromAccountId = IBAN.from(row[`${prefix}from_account_id`]);

    const toAccountId = IBAN.from(row[`${prefix}to_account_id`]);

    const amount = Money.from({
      amount: row[`${prefix}amount`],
      currency: row[`${prefix}currency`],
    });

    return TransactionEntity.from({
      id: row[`${prefix}id`],
      fromAccountId,
      toAccountId,
      amount,
      label: row[`${prefix}label`],
      icon: row[`${prefix}icon`],
      date: row[`${prefix}date`],
    });
  }

  static mapDocToTransaction(doc: any): TransactionEntity {
    const amount = Money.from(doc.amount);
    const fromAccountId = IBAN.from(doc.fromAccountId);
    const toAccountId = IBAN.from(doc.toAccountId);

    return TransactionEntity.from({
      id: doc._id.toString(),
      fromAccountId,
      toAccountId,
      amount,
      label: doc.label,
      icon: doc.icon,
      date: doc.date,
    });
  }
}
