import { FactorNegativeError } from "../errors/money/MoneyFactorNegativeError";
import { MoneyAmountInvalidError } from "../errors/money/MoneyAmountInvalidError";
import { MoneyAmountNegativeError } from "../errors/money/MoneyAmountNegativeError";
import { MoneyCurrencyMissingError } from "../errors/money/MoneyCurrencyMissingError";
import { MoneyCurrencyMismatchError } from "../errors/money/MoneyCurrencyMismatchError";

export class Money {
  private static readonly SCALE = 2;

  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  public static from({
    amount,
    currency,
  }: Pick<Money, "amount" | "currency">): Money {
    return new Money(amount, currency);
  }

  /**
   * Fabrique un objet Money.
   * Retourne soit une instance valide, soit une erreur métier.
   */
  public static create({
    amount,
    currency,
  }: Pick<Money, "amount" | "currency">):
    | Money
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    if (!currency || currency.trim() === "") {
      return new MoneyCurrencyMissingError(currency);
    }

    if (amount == null || isNaN(amount)) {
      return new MoneyAmountInvalidError(amount);
    }

    if (amount < 0) {
      return new MoneyAmountNegativeError(amount);
    }

    const scaledAmount = Number(amount.toFixed(Money.SCALE));
    return new Money(scaledAmount, currency.toUpperCase());
  }

  public add(other: Money): Money | MoneyCurrencyMismatchError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError) return currencyError;
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(
    other: Money
  ):
    | Money
    | MoneyCurrencyMismatchError
    | MoneyAmountNegativeError
    | MoneyAmountInvalidError
    | MoneyCurrencyMissingError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError instanceof Error) return currencyError;
    const result = this.amount - other.amount;
    const money = Money.create({ amount: result, currency: this.currency });
    return money;
  }

  private ensureSameCurrency(other: Money): MoneyCurrencyMismatchError | void {
    if (this.currency !== other.currency) {
      return new MoneyCurrencyMismatchError();
    }
  }

  public equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  public toString(): string {
    return `${this.amount.toFixed(Money.SCALE)} ${this.currency}`;
  }
  public multiply(
    factor: number
  ):
    | Money
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    if (factor < 0) {
      return new FactorNegativeError();
    }

    const resultAmount = Number((this.amount * factor).toFixed(Money.SCALE));

    const resultOrError = Money.create({
      amount: resultAmount,
      currency: this.currency,
    });
    if (resultOrError instanceof Error) return resultOrError;
    return resultOrError;
  }
}
