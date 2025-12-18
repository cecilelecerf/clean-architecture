import { IBAN } from "@domain/values/IBAN";
import { UserEntity } from "./UserEntity";
import { Money } from "@domain/values/Money"; 
import { Color } from "@domain/values/Color";
import { FactorNegativeError, MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMismatchError, MoneyCurrencyMissingError } from "@domain/errors/money";
import { InvalidAccountNameError } from "@domain/errors/account";
import { AccountOwner } from "@domain/values/AccountOwner";
import { InvalidAccountTypeError } from "@domain/errors/account/InvalidAccountType";

export class AccountEntity {
  private constructor(
    public iban: IBAN,
    public owner: AccountOwner,
    // public userId: UserEntity["id"],
    public name: string,
    public type: "courant" | "epargne",
    public color:Color,
    public balance: Money,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}

  public static create({
    iban,
    owner,
    name,
    type,
    balance,
    color,
    createdAt,
    updatedAt,
  }: Pick<
    AccountEntity,
    | "iban"
    | "owner"
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
      owner,
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
    owner,
    name,
    type,
    balance,
    color,
    createdAt,
    updatedAt,
  }: Pick<
    AccountEntity,
    | "iban"
    | "owner"
    | "name"
    | "type"
    | "color"
    | "balance"
    | "createdAt"
    | "updatedAt"
  >) {
    return new AccountEntity(
      iban,
      owner,
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

  public canBeModifiedBy(user: UserEntity): boolean {
    return this.owner.belongsTo(user.id);
  }

  public isBankAccount(): boolean {
    return this.owner.role === "bank";
  }

  public isClientAccount(): boolean {
    return this.owner.role === "client";
  }

  public canBeRenamedBy(user: UserEntity): boolean {
    return (
      user.hasRole({ role: "client" }) &&
      this.owner.belongsTo(user.id)
    );
  }

  public rename(
    newName: string,
    user: UserEntity,
    updatedAt: Date
  ): InvalidAccountNameError | InvalidAccountNameError | void {
    if (!user.hasRole({ role: "client" })) {
      return new InvalidAccountNameError();
    }

    if (!this.owner.belongsTo(user.id)) {
      return new InvalidAccountNameError();
    }

    const verifiedName = AccountEntity.verifyName(newName);
    if (verifiedName instanceof Error) return verifiedName;

    this.name = verifiedName;
    this.updatedAt = updatedAt;
  }

  public applyDailyInterest(
    bankAccount: AccountEntity,
    dailyRate: number
  ):
    | FactorNegativeError
    | InvalidAccountTypeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | MoneyCurrencyMismatchError
    | Money {

    if (this.type !== "epargne") return new InvalidAccountTypeError;

    const interest = this.balance.multiply(dailyRate);
    if (interest instanceof Error) return interest;

    const depositResult = this.deposit(interest);
    if (depositResult instanceof Error) return depositResult;

    const withdrawResult = bankAccount.withdraw(interest);
    if (withdrawResult instanceof Error) {
      this.withdraw(interest);
      return withdrawResult;
    }

    return this.getBalance();
  }

}
