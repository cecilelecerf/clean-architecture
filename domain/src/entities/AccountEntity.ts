import { IBAN } from "../values/IBAN";
import { UserEntity } from "./UserEntity";
import { Money, MoneyToDTO } from "@domain/values/Money";
import { Color } from "@domain/values/Color";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import {
  InsufficientFundsError,
  InvalidAccountNameError,
} from "@domain/errors/account";
import { InvalidAccountTypeError } from "@domain/errors/account/InvalidAccountType";
import { TransactionEntity } from "./TransactionEntity";

export class AccountEntity {
  private constructor(
    public iban: IBAN,
    public name: string,
    public type: "courant" | "epargne" | "pret",
    public color: Color,
    public balance: Money,
    public createdAt: Date,
    public updatedAt: Date,
    public userId?: UserEntity["id"] | null,
    public lastInterestTransactionId?: TransactionEntity["id"] | null
  ) {}

  public static create({
    iban,
    name,
    type,
    balance,
    color,
    createdAt,
    userId,
  }: Pick<
    AccountEntity,
    "iban" | "name" | "color" | "balance" | "createdAt" | "userId"
  > & { type: string }):
    | AccountEntity
    | InvalidAccountNameError
    | InvalidAccountTypeError {
    const verifiedName = this.verifyName(name);
    if (verifiedName instanceof Error) return verifiedName;

    const validateType = this.validateType(type);
    if (validateType instanceof Error) return validateType;

    return new AccountEntity(
      iban,
      name,
      validateType,
      color,
      balance,
      createdAt,
      createdAt,
      userId,
      null
    );
  }

  public static from({
    iban,
    name,
    type,
    balance,
    color,
    createdAt,
    userId,
    updatedAt,
    lastInterestTransactionId,
  }: Pick<
    AccountEntity,
    | "iban"
    | "name"
    | "type"
    | "color"
    | "balance"
    | "createdAt"
    | "userId"
    | "updatedAt"
    | "lastInterestTransactionId"
  >) {
    return new AccountEntity(
      iban,
      name,
      type,
      color,
      balance,
      createdAt,
      updatedAt,
      userId,
      lastInterestTransactionId
    );
  }

  public credit(amount: Money): AccountEntity {
    const newBalence = this.balance.add(amount);
    this.balance = newBalence;
    return this;
  }

  public debit(
    amount: Money
  ):
    | AccountEntity
    | MoneyAmountNegativeError
    | MoneyAmountInvalidError
    | MoneyCurrencyMissingError
    | InsufficientFundsError {
    const newBalence = this.balance.subtract(amount);
    if (newBalence instanceof Error) return newBalence;

    this.balance = newBalence;
    return this;
  }

  public getBalance(): Money {
    return this.balance;
  }

  private static verifyName(
    name: AccountEntity["name"]
  ): InvalidAccountNameError | AccountEntity["name"] {
    const trimedName = name.trim();
    if (trimedName.length < 10 || trimedName.length > 100)
      return new InvalidAccountNameError();
    return trimedName;
  }
  private static validateType(
    type: string
  ): "courant" | "epargne" | InvalidAccountTypeError {
    if (type !== "courant" && type !== "epargne") {
      return new InvalidAccountTypeError(type);
    }
    return type;
  }

  public isBankAccount(): boolean {
    return this.userId === null;
  }

  public isClientAccount(user: UserEntity): boolean {
    return user.hasRole({ role: "client" }) && user.id === this.userId;
  }

  public canBeRenamedBy(user: UserEntity): boolean {
    return user.hasRole({ role: "client" }) && user.id === this.userId;
  }

  public rename(
    newName: string,
    user: UserEntity,
    updatedAt: Date
  ): InvalidAccountNameError | InvalidAccountNameError | void {
    if (!user.hasRole({ role: "client" })) {
      return new InvalidAccountNameError();
    }

    const verifiedName = AccountEntity.verifyName(newName);
    if (verifiedName instanceof Error) return verifiedName;

    this.name = verifiedName;
    this.updatedAt = updatedAt;
  }

  public applyDailyInterest(
    dailyRate: number
  ):
    | FactorNegativeError
    | InvalidAccountTypeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | Money {
    if (this.type !== "epargne") return new InvalidAccountTypeError();

    const interest = this.balance.multiply(dailyRate);
    if (interest instanceof Error) return interest;

    return interest;
  }
  public updateLastInterestTransaction(
    transactionId: TransactionEntity["id"]
  ): void {
    this.lastInterestTransactionId = transactionId;
  }

  public toDTO(): AccountDTO {
    return {
      IBAN: this.iban.value,
      name: this.name,
      type: this.type,
      color: this.color.getValue(),
      balance: this.balance.toJSON(),
      userId: this.userId,
    };
  }
}

export type AccountDTO = {
  IBAN: string;
  color: string;
  balance: MoneyToDTO;
} & Pick<AccountEntity, "name" | "type" | "userId">;
