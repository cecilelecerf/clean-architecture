import { IBAN } from "@domain/values/IBAN";
import { UserEntity } from "./UserEntity";
import { Money } from "@domain/values/Money"; 
import { Color } from "@domain/values/Color";
import { MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMismatchError, MoneyCurrencyMissingError } from "@domain/errors/money";
import { InvalidAccountNameError } from "@domain/errors/account";

export class AccountEntity {
  private constructor(
    public iban: IBAN,
    public userId: UserEntity["id"],
    public name: string,
    public type: "courant" | "epargne",
    public color:Color,
    public balance: Money,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}

  public static create({
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
  >): AccountEntity | InvalidAccountNameError{
    const verifiedName = this.verifyName(name);
    if (verifiedName instanceof Error) return verifiedName;

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

  public static verifyName(name: AccountEntity["name"]): InvalidAccountNameError | AccountEntity["name"]
  {
    const trimedName = name.trim();
    if (trimedName.length < 10 || trimedName.length > 100)
      return new InvalidAccountNameError();
    return trimedName;
  }

  public permissionToModify(user: UserEntity): boolean {
    return (
      user.hasRole({ role: "client" }) && user.id === this.userId
    );
  }
}
