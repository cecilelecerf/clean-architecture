import { IBAN } from "@domain/values/IBAN";
import { UserEntity } from "./UserEntity";

export class AccountEntity {
  private constructor(
    public id: string,
    public userId: UserEntity["id"],
    public iban: IBAN,
    public name: string,
    public type: "courant" | "epargne",
    public balance: number,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}

  public static from({
    id,
    userId,
    iban,
    name,
    type,
    balance,
    createdAt,
    updatedAt,
  }: AccountEntity) {
    return new AccountEntity(
      id,
      userId,
      iban,
      name,
      type,
      balance,
      createdAt,
      updatedAt
    );
  }

  public deposit(amount: Money): void {
    this.balance = this.balance.add(amount);
  }

  // Retirer de l'argent
  public withdraw(amount: Money): void {
    if (this.balance.amount < amount.amount) {
      throw new Error("Insufficient funds");
    }
    this.balance = this.balance.subtract(amount);
  }

  // Obtenir le solde actuel
  public getBalance(): Money {
    return this.balance;
  }
}
