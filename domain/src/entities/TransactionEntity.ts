import { Money } from "@domain/values/Money";
import { AccountEntity } from "./AccountEntity";

export class TransactionEntity {
  private constructor(
    public id: string,
    public fromAccountId: AccountEntity["iban"],
    public toAccountId: AccountEntity["iban"],
    public amount: Money,
    public date: Date,
    public type: "credit" | "debit"
  ) {}

  public static from({
    id,
    fromAccountId,
    toAccountId,
    amount,
    date,
    type,
  }: TransactionEntity) {
    return new TransactionEntity(
      id,
      fromAccountId,
      toAccountId,
      amount,
      date,
      type
    );
  }
}
