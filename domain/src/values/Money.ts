import { InsufficientFundsError } from "@domain/errors/account";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";

export class Money {
  private static readonly SCALE = 2;

  private constructor(public amount: number, public currency: string) {}

  public static from({
    amount,
    currency,
  }: Pick<Money, "amount" | "currency">): Money {
    return new Money(Number(amount), currency.toUpperCase());
  }

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

  public add(other: Money): Money {
    return new Money(
      Number((this.amount + other.amount).toFixed(Money.SCALE)),
      this.currency
    );
  }

  public subtract(other: Money): Money | InsufficientFundsError {
    const result = this.amount - other.amount;
    if (result < 0) {
      return new InsufficientFundsError(this, other);
    }
    return new Money(Number(result.toFixed(Money.SCALE)), this.currency);
  }

  public multiply(factor: number): Money | FactorNegativeError {
    if (factor < 0) {
      return new FactorNegativeError();
    }

    const resultAmount = Number((this.amount * factor).toFixed(Money.SCALE));
    const result = Money.create({
      amount: resultAmount,
      currency: this.currency,
    });
    if (result instanceof Error) throw result;
    return result;
  }

  public divide(divisor: number): Money | FactorNegativeError {
    if (divisor <= 0) {
      return new FactorNegativeError();
    }

    const resultAmount = Number((this.amount / divisor).toFixed(Money.SCALE));
    const result = Money.create({
      amount: resultAmount,
      currency: this.currency,
    });
    if (result instanceof Error) throw result;
    return result;
  }

  public convertTo(
    targetCurrency: string,
    fromRate: number,
    toRate: number
  ): Money {
    if (this.currency === targetCurrency.toUpperCase()) {
      return this;
    }

    const amountInUSD = this.amount / fromRate;
    const convertedAmount = amountInUSD * toRate;

    const result = Money.create({
      amount: Number(convertedAmount.toFixed(Money.SCALE)),
      currency: targetCurrency.toUpperCase(),
    });

    if (result instanceof Error) throw result;
    return result;
  }

  public equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  public isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  public isLessThan(other: Money): boolean {
    return this.amount < other.amount;
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }

  public isLessThanOrEqual(other: Money): boolean {
    return this.amount <= other.amount;
  }

  public toString(): string {
    return `${this.amount.toFixed(Money.SCALE)} ${this.currency}`;
  }

  public toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  public format(locale: string = "fr-FR"): string {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CHF: "CHF",
      CAD: "CA$",
      AUD: "A$",
      CNY: "¥",
    };

    const symbol = symbols[this.currency] || this.currency;
    const formattedAmount = this.amount.toLocaleString(locale, {
      minimumFractionDigits: Money.SCALE,
      maximumFractionDigits: Money.SCALE,
    });

    if (this.currency === "EUR") {
      return `${formattedAmount} ${symbol}`;
    }
    return `${symbol}${formattedAmount}`;
  }
}
