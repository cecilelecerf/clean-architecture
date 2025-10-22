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
  }: Pick<
    AccountEntity,
    "iban" | "userId" | "name" | "type" | "balance" | "createdAt" | "updatedAt"
  >) {
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
    const result = this.balance.add(amount);

    if (result instanceof Money) {
      this.balance = result;
    }
  }

  // Retirer de l'argent
  public withdraw(amount: Money): void {
    if (this.balance.amount < amount.amount) {
      throw new Error("Insufficient funds");
    }

    const result = this.balance.subtract(amount);
    if (result instanceof Money) {
      this.balance = result;
    }
  }

  // Obtenir le solde actuel
  public getBalance(): Money {
    return this.balance;
  }
}
