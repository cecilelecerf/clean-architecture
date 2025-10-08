import { Money } from "@domain/values/Money";
import { UserEntity } from "./UserEntity";

export class TransactionEntity {
  private constructor(
    public id: string,
    public fromAccountId: UserEntity["id"],
    public toAccountId: UserEntity["id"],
    public amount: Money,
    public date: Date,
    public type: "credit" | "debit"
  ) {}
  public static create({
    fromAccountId,
    toAccountId,
    amount,
    type,
  }: Pick<
    TransactionEntity,
    "fromAccountId" | "toAccountId" | "amount" | "type"
  >): TransactionEntity | Error {
    if (fromAccountId === toAccountId) {
      return new Error("Transaction cannot be made to the same account");
    }

    if (amount.amount <= 0) {
      return new Error("Transaction amount must be positive");
    }

    const now = new Date();
    return new TransactionEntity(
      crypto.randomUUID(),
      fromAccountId,
      toAccountId,
      amount,
      now,
      type
    );
  }
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
