import { UserEntity } from "./UserEntity";

export class TransactionEntity {
  private constructor(
    public id: string,
    public fromAccountId: UserEntity["id"],
    public toAccountId: UserEntity["id"],
    public amount: number,
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
