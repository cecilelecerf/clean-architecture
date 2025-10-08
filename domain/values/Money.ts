import { FactorNegativeError } from "@domain/errors/money/MoneyFactorNegativeError";
import { MoneyAmountInvalidError } from "@domain/errors/money/MoneyAmountInvalidError";
import { MoneyAmountNegativeError } from "@domain/errors/money/MoneyAmountNegativeError";
import { MoneyCurrencyMissingError } from "@domain/errors/money/MoneyCurrencyMissingError";
import { MoneyCurrencyMismatchError } from "@domain/errors/money/MoneyCurrencyMismatchError";

export class Money {
  private static readonly SCALE = 2;

  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  /**
   * Fabrique un objet Money.
   * Retourne soit une instance valide, soit une erreur métier.
   */
  public static create(
    amount: number,
    currency: string
  ):
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
  ): Money | MoneyCurrencyMismatchError | MoneyAmountNegativeError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError) return currencyError;
    const result = this.amount - other.amount;
    if (result < 0) return new MoneyAmountNegativeError(result);
    return new Money(result, this.currency);
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
  public multiply(factor: number): Money | Error {
    if (factor < 0) {
      return new FactorNegativeError();
    }

    const resultAmount = Number((this.amount * factor).toFixed(Money.SCALE));

    const resultOrError = Money.create(resultAmount, this.currency);

    return resultOrError;
  }
}
