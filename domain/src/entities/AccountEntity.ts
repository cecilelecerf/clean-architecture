import { IBAN } from "@domain/values/IBAN";
import { UserEntity } from "./UserEntity";
import { Money } from "@domain/values/Money";
import { Color } from "@domain/values/Color";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMismatchError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { InvalidAccountNameError } from "@domain/errors/account";
import { InvalidAccountTypeError } from "@domain/errors/account/InvalidAccountType";
import { TransactionEntity } from "./TransactionEntity";

// TODO: Ajouter le RIB, CVE etc... carte? -> boolean pour savoir si le compte est lié à une carte pareil pour cheque? -> boolean
// TODO: Ajouter le sexe de l'utilisateur 
// TODO: Ajouter adresse de l'utilisateur
// TODO: Ajouter numéro de téléphone de l'utilisateur
export class AccountEntity {
  private constructor(
    public iban: IBAN,
    public name: string,
    public type: "courant" | "epargne",
    public color: Color,
    public balance: Money,
    public currency: string,
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
    currency,
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
    | "currency"
    | "createdAt"
    | "userId"
    | "updatedAt"
    | "lastInterestTransactionId"
  >): AccountEntity | InvalidAccountNameError {
    const verifiedName = this.verifyName(name);
    if (verifiedName instanceof Error) return verifiedName;

    return new AccountEntity(
      iban,
      name,
      type,
      color,
      balance,
      currency,
      createdAt,
      updatedAt,
      userId,
      lastInterestTransactionId
    );
  }

  public static from({
    iban,
    name,
    type,
    balance,
    currency,
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
    | "currency"
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
      currency,
      createdAt,
      updatedAt,
      userId,
      lastInterestTransactionId
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

  public static verifyName(
    name: AccountEntity["name"]
  ): InvalidAccountNameError | AccountEntity["name"] {
    const trimedName = name.trim();
    if (trimedName.length < 10 || trimedName.length > 100)
      return new InvalidAccountNameError();
    return trimedName;
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
      currency: this.currency,
      color: this.color.getValue(),
      amount: this.balance.amount,
      userId: this.userId,
    };
  }
}

export type AccountDTO = {
  IBAN: string;
  color: string;
  amount: number;
} & Pick<AccountEntity, "name" | "type" | "currency" | "userId">;
