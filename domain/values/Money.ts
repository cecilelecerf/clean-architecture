import { MoneyAmountInvalidError } from "@domain/errors/money/MoneyAmountInvalidError";
import { MoneyAmountNegativeError } from "@domain/errors/money/MoneyAmountNegativeError";
import { MoneyCurrencyMissingError } from "@domain/errors/money/MoneyCurrencyMissingError";

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
  ): Money | Error {
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
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) throw new MoneyAmountNegativeError(result);
    return new Money(result, this.currency);
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error("Les devises doivent être identiques");
    }
  }

  public equals(other: Money): boolean {
    return (
      this.currency === other.currency &&
      this.amount === other.amount
    );
  }

  public toString(): string {
    return `${this.amount.toFixed(Money.SCALE)} ${this.currency}`;
  }
}
