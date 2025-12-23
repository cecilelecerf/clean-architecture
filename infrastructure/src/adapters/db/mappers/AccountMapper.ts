import { AccountEntity } from "@domain/entities/AccountEntity";
import { Color } from "@domain/values/Color";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { RowDataPacket } from "mysql2";

export class AccountMapper {
  static mapRowToAccount(
    row: RowDataPacket,
    prefix: string = ""
  ): AccountEntity {
    const iban = IBAN.from(row[`${prefix}iban`]);

    const balance = Money.from({
      amount: Number(row[`${prefix}balance`]),
      currency: row[`${prefix}currency`],
    });

    const color = Color.from(row[`${prefix}color`]);

    return AccountEntity.from({
      iban,
      userId: row[`${prefix}user_id`] ?? null,
      name: row[`${prefix}name`],
      type: row[`${prefix}type`],
      color,
      balance,
      currency: row[`${prefix}currency`],
      createdAt: row[`${prefix}created_at`],
      updatedAt: row[`${prefix}updated_at`],
    });
  }
  static mapDocToAccount(doc: any): AccountEntity {
    const iban = IBAN.from(doc.iban);
    const balance = Money.from({
      amount: Number(doc.balance),
      currency: doc.currency,
    });
    const color = Color.from(doc.color);

    return AccountEntity.from({
      iban,
      userId: doc.userId ?? null,
      name: doc.name,
      type: doc.type,
      color,
      balance,
      currency: doc.currency,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
