import { InsufficientFundsError } from "@domain/errors/account";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMismatchError,
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

  public add(other: Money): Money | MoneyCurrencyMismatchError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError) return currencyError;
    return new Money(
      Number((this.amount + other.amount).toFixed(Money.SCALE)),
      this.currency
    );
  }

  public subtract(
    other: Money
  ): Money | InsufficientFundsError | MoneyCurrencyMismatchError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError instanceof Error) return currencyError;

    const result = this.amount - other.amount;

    if (result < 0) {
      return new InsufficientFundsError(this, other);
    }

    return new Money(Number(result.toFixed(Money.SCALE)), this.currency);
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

  public divide(
    divisor: number
  ):
    | Money
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    if (divisor <= 0) {
      return new FactorNegativeError();
    }

    const resultAmount = Number((this.amount / divisor).toFixed(Money.SCALE));

    const resultOrError = Money.create({
      amount: resultAmount,
      currency: this.currency,
    });
    if (resultOrError instanceof Error) return resultOrError;
    return resultOrError;
  }

  /**
   * Convertit ce montant vers une autre devise en utilisant les taux de change fournis.
   *
   * @param targetCurrency - Le code de la devise cible (ex: "EUR")
   * @param fromRate - Le taux de change de la devise source par rapport à USD
   * @param toRate - Le taux de change de la devise cible par rapport à USD
   *
   * Exemple: Convertir 100 EUR vers GBP
   * - fromRate (EUR): 0.91 (1 USD = 0.91 EUR)
   * - toRate (GBP): 0.78 (1 USD = 0.78 GBP)
   * - Calcul: 100 EUR → USD: 100 / 0.91 = 109.89 USD
   *          109.89 USD → GBP: 109.89 * 0.78 = 85.71 GBP
   */
  public convertTo(
    targetCurrency: string,
    fromRate: number,
    toRate: number
  ):
    | Money
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    if (this.currency === targetCurrency.toUpperCase()) {
      return this;
    }

    const amountInUSD = this.amount / fromRate;

    const convertedAmount = amountInUSD * toRate;

    return Money.create({
      amount: Number(convertedAmount.toFixed(Money.SCALE)),
      currency: targetCurrency.toUpperCase(),
    });
  }

  /**
   * Version simplifiée de conversion si tu as accès aux CurrencyEntity directement
   */
  public static convert(
    money: Money,
    fromCurrency: { code: string; exchangeRate: number },
    toCurrency: { code: string; exchangeRate: number }
  ):
    | Money
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    return money.convertTo(
      toCurrency.code,
      fromCurrency.exchangeRate,
      toCurrency.exchangeRate
    );
  }

  private ensureSameCurrency(other: Money): MoneyCurrencyMismatchError | void {
    if (this.currency !== other.currency) {
      return new MoneyCurrencyMismatchError();
    }
  }

  public equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  public isGreaterThan(other: Money): boolean | MoneyCurrencyMismatchError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError) return currencyError;
    return this.amount > other.amount;
  }

  public isLessThan(other: Money): boolean | MoneyCurrencyMismatchError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError) return currencyError;
    return this.amount < other.amount;
  }

  public isGreaterThanOrEqual(
    other: Money
  ): boolean | MoneyCurrencyMismatchError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError) return currencyError;
    return this.amount >= other.amount;
  }

  public isLessThanOrEqual(other: Money): boolean | MoneyCurrencyMismatchError {
    const currencyError = this.ensureSameCurrency(other);
    if (currencyError) return currencyError;
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

  /**
   * Formatte le montant avec le symbole de devise approprié
   */
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
