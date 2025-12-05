import { IBAN } from "../values/IBAN";
import { UserEntity } from "./UserEntity";
import { Money } from "../values/Money";
import { MoneyCurrencyMismatchError } from "../errors/money/MoneyCurrencyMismatchError";
import { MoneyAmountNegativeError } from "../errors/money/MoneyAmountNegativeError";
import { MoneyAmountInvalidError } from "../errors/money/MoneyAmountInvalidError";
import { MoneyCurrencyMissingError } from "../errors/money/MoneyCurrencyMissingError";

// TODO : Add in adapter
// ? add color

export class AccountEntity {
  private constructor(
    public iban: IBAN,
    public userId: UserEntity["id"],
    public name: string,
    public type: "courant" | "epargne",
    public color:
      | "yellow"
      | "red"
      | "blue"
      | "green"
      | "purple"
      | "orange"
      | "pink"
      | "teal"
      | "brown"
      | "cyan"
      | "grey",
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
    color,
    createdAt,
    updatedAt,
  }: Pick<
    AccountEntity,
    | "iban"
    | "userId"
    | "name"
    | "type"
    | "color"
    | "balance"
    | "createdAt"
    | "updatedAt"
  >) {
    return new AccountEntity(
      iban,
      userId,
      name,
      type,
      color,
      balance,
      createdAt,
      updatedAt
    );
  }

  public deposit(amount: Money): AccountEntity | MoneyCurrencyMismatchError {
    const newBalence = this.balance.add(amount);
    if (newBalence instanceof Error) return newBalence;
    this.balance = newBalence;
    return this;
  }

  // Retirer de l'argent
  public withdraw(
    amount: Money
  ):
    | MoneyCurrencyMismatchError
    | MoneyAmountNegativeError
    | AccountEntity
    | MoneyAmountNegativeError
    | MoneyAmountInvalidError
    | MoneyCurrencyMissingError {
    const newBalence = this.balance.subtract(amount);
    if (newBalence instanceof Error) return newBalence;

    this.balance = newBalence;
    return this;
  }

  // Obtenir le solde actuel
  public getBalance(): Money {
    return this.balance;
  }
}
