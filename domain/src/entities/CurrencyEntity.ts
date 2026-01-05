import {
  InvalidCurrencyCodeError,
  InvalidExchangeRateError,
} from "@domain/errors/currency";

export class CurrencyEntity {
  private constructor(
    public readonly code: string,
    public exchangeRate: number, // Taux par rapport à l'USD (USD = 1.0)
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  private static validateCode(code: string): string | InvalidCurrencyCodeError {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length !== 3) {
      return new InvalidCurrencyCodeError(code);
    }
    return trimmedCode;
  }

  private static validateExchangeRate(
    rate: number
  ): number | InvalidExchangeRateError {
    if (rate <= 0 || !Number.isFinite(rate)) {
      return new InvalidExchangeRateError(rate);
    }
    return rate;
  }

  public static create({
    code,
    exchangeRate,
    createdAt,
  }: {
    code: string;
    exchangeRate: number;
    createdAt: Date;
  }): CurrencyEntity | InvalidCurrencyCodeError | InvalidExchangeRateError {
    const validatedCode = this.validateCode(code);
    if (validatedCode instanceof Error) return validatedCode;

    const validatedRate = this.validateExchangeRate(exchangeRate);
    if (validatedRate instanceof Error) return validatedRate;

    return new CurrencyEntity(
      validatedCode,
      validatedRate,
      createdAt,
      createdAt
    );
  }

  public static from({
    code,
    exchangeRate,
    createdAt,
    updatedAt,
  }: {
    code: string;
    exchangeRate: number;
    createdAt: Date;
    updatedAt: Date;
  }): CurrencyEntity {
    return new CurrencyEntity(code, exchangeRate, createdAt, updatedAt);
  }

  public updateExchangeRate({
    newRate,
    now,
  }: {
    newRate: number;
    now: Date;
  }): CurrencyEntity | InvalidExchangeRateError {
    const validatedRate = CurrencyEntity.validateExchangeRate(newRate);
    if (validatedRate instanceof Error) return validatedRate;

    this.exchangeRate = validatedRate;
    this.updatedAt = now;
    return this;
  }

  public convertToUSD(amount: number): number {
    return amount / this.exchangeRate;
  }

  public convertFromUSD(amount: number): number {
    return amount * this.exchangeRate;
  }

  public static convert(
    amount: number,
    fromCurrency: CurrencyEntity,
    toCurrency: CurrencyEntity
  ): number {
    const amountInUSD = fromCurrency.convertToUSD(amount);

    return toCurrency.convertFromUSD(amountInUSD);
  }

  public toDTO(): CurrencyToDTO {
    return {
      code: this.code,
      exchangeRate: this.exchangeRate,
      symbol: this.getSymbol(),
      name: this.getName(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  private getSymbol(): string {
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
    return symbols[this.code] || this.code;
  }

  private getName(): string {
    const names: Record<string, string> = {
      USD: "Dollar américain",
      EUR: "Euro",
      GBP: "Livre sterling",
      JPY: "Yen japonais",
      CHF: "Franc suisse",
      CAD: "Dollar canadien",
      AUD: "Dollar australien",
      CNY: "Yuan chinois",
    };
    return names[this.code] || this.code;
  }
}

export type CurrencyToDTO = {
  symbol: string;
  name: string;
  createdAt: string;
  updatedAt: string;
} & Pick<CurrencyEntity, "code" | "exchangeRate">;
