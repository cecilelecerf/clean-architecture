import {
  InvalidActionNameError,
  InvalidISINError,
  InvalidSymbolError,
  InvalidTotalNbError,
} from "@domain/errors/action";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { Money } from "@domain/values/Money";

export class ActionEntity {
  private constructor(
    public ISIN: string,
    public name: string,
    public symbol: string,
    public market: string,
    public activitySector: string,
    public price: Money,
    public isAvailable: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  private static validateISIN(isin: string): string | InvalidISINError {
    const trimmed = isin.trim().toUpperCase();
    const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

    if (!isinRegex.test(trimmed)) {
      return new InvalidISINError(isin);
    }

    return trimmed;
  }

  private static validateName(name: string): string | InvalidActionNameError {
    const trimmed = name.trim();

    if (trimmed.length < 2 || trimmed.length > 100) {
      return new InvalidActionNameError(name);
    }

    return trimmed;
  }

  private static validateSymbol(symbol: string): string | InvalidSymbolError {
    const trimmed = symbol.trim().toUpperCase();

    if (trimmed.length < 1 || trimmed.length > 10) {
      return new InvalidSymbolError(symbol);
    }

    return trimmed;
  }

  private static validateMarket(market: string): string {
    return market.trim();
  }

  private static validateActivitySector(sector: string): string {
    return sector.trim();
  }

  public static create({
    ISIN,
    name,
    symbol,
    market,
    activitySector,
    price,
    isAvailable,
    createdAt,
  }: Pick<
    ActionEntity,
    | "ISIN"
    | "name"
    | "symbol"
    | "market"
    | "activitySector"
    | "price"
    | "isAvailable"
    | "createdAt"
  >):
    | ActionEntity
    | InvalidISINError
    | InvalidActionNameError
    | InvalidSymbolError
    | InvalidTotalNbError {
    const validatedISIN = this.validateISIN(ISIN);
    if (validatedISIN instanceof Error) return validatedISIN;

    const validatedName = this.validateName(name);
    if (validatedName instanceof Error) return validatedName;

    const validatedSymbol = this.validateSymbol(symbol);
    if (validatedSymbol instanceof Error) return validatedSymbol;

    const validatedMarket = this.validateMarket(market);
    const validatedActivitySector = this.validateActivitySector(activitySector);

    return new ActionEntity(
      validatedISIN,
      validatedName,
      validatedSymbol,
      validatedMarket,
      validatedActivitySector,
      price,
      isAvailable,
      createdAt,
      createdAt
    );
  }

  public static from({
    ISIN,
    name,
    symbol,
    market,
    activitySector,
    price,
    isAvailable,
    createdAt,
    updatedAt,
  }: Pick<
    ActionEntity,
    | "ISIN"
    | "name"
    | "symbol"
    | "market"
    | "activitySector"
    | "price"
    | "isAvailable"
    | "createdAt"
    | "updatedAt"
  >) {
    return new ActionEntity(
      ISIN,
      name,
      symbol,
      market,
      activitySector,
      price,
      isAvailable,
      createdAt,
      updatedAt
    );
  }
  public enable({ now }: { now: Date }): void {
    this.isAvailable = true;
    this.updatedAt = now;
  }

  public disable({ now }: { now: Date }): void {
    this.isAvailable = false;
    this.updatedAt = now;
  }

  updatePrice({
    newPrice,
    now,
  }: {
    newPrice: Money;
    now: Date;
  }):
    | ActionEntity
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | MoneyCurrencyMissingError {
    if (newPrice.currency !== this.price.currency) {
      return new MoneyCurrencyMissingError(newPrice.currency);
    }
    this.price = newPrice;
    this.updatedAt = now;
    return this;
  }

  update({
    name,
    totalNb,
    symbol,
    market,
    activitySector,
    price,
    isAvailable,
    now,
  }: {
    name?: string;
    totalNb?: number;
    symbol?: string;
    market?: string;
    activitySector?: string;
    price?: Money;
    isAvailable?: boolean;
    now: Date;
  }) {
    if (name) this.name = name;
    if (symbol) this.symbol = symbol;
    if (market) this.market = market;
    if (activitySector) this.activitySector = activitySector;
    if (price) this.price = price;
    if (isAvailable !== undefined) {
      isAvailable ? this.enable({ now }) : this.disable({ now });
    }
  }
}
