import { IBAN } from "@domain/values/IBAN";
import { UserEntity } from "./UserEntity";
import { Money } from "@domain/values/Money";

export class AccountEntity {
  private constructor(
    public iban: IBAN,
    public userId: UserEntity["id"],
    public name: string,
    public type: "courant" | "epargne",
    public balance: Money,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}

  public static from({
    iban,
    userId,
    name,
    type,
    balance,
    createdAt,
    updatedAt,
  }: AccountEntity) {
    return new AccountEntity(
      iban,
      userId,
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
