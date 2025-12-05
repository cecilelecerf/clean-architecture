import { Money } from "../values/Money";
import { AccountEntity } from "./AccountEntity";

// TODO add label and icon

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
