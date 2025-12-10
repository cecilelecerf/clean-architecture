import { Money } from "@domain/values/Money";
import { AccountEntity } from "./AccountEntity";

export class TransactionEntity {
  private constructor(
    public id: string,
    public label: string,
    public icon: string,
    public fromAccountId: AccountEntity["iban"],
    public toAccountId: AccountEntity["iban"],
    public amount: Money,
    public date: Date,
    public type: "credit" | "debit"
  ) {}

  public static create({
    id,
    fromAccountId,
    label,
    icon,
    toAccountId,
    amount,
    type,
  }: Pick<
    TransactionEntity,
    | "fromAccountId"
    | "toAccountId"
    | "amount"
    | "type"
    | "id"
    | "label"
    | "icon"
  >): TransactionEntity | Error {
    // Création d'une vraie error
    if (fromAccountId === toAccountId) {
      return new Error("Transaction cannot be made to the same account");
    }

    // Error impossible car déjà vérifier avec le type Date
    if (amount.amount <= 0) {
      return new Error("Transaction amount must be positive");
    }

    const now = new Date();
    return new TransactionEntity(
      id,
      label,
      icon,
      fromAccountId,
      toAccountId,
      amount,
      now,
      type
    );
  }

  public static from({
    id,
    label,
    icon,
    fromAccountId,
    toAccountId,
    amount,
    date,
    type,
  }: Pick<
    TransactionEntity,
    | "id"
    | "fromAccountId"
    | "toAccountId"
    | "label"
    | "icon"
    | "amount"
    | "date"
    | "type"
  >) {
    return new TransactionEntity(
      id,
      label,
      icon,
      fromAccountId,
      toAccountId,
      amount,
      date,
      type
    );
  }
}
