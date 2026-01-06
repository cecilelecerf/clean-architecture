import {
  InvalidActionNameError,
  InvalidSymbolError,
  InvalidQuantityError,
} from "@domain/errors/action";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { ISIN } from "@domain/values/ISIN";
import { Money } from "@domain/values/Money";

export class ActionEntity {
  private constructor(
    public ISIN: ISIN,
    public name: string,
    public symbol: string,
    public market: string,
    public activitySector: string,
    public price: Money,
    public isAvailable: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public defaultQuantity: number
  ) {}

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
  public static validateDefaultQuantity(quantity: number): boolean {
    return quantity > 0;
  }

  public static create({
    name,
    symbol,
    market,
    activitySector,
    price,
    isAvailable,
    createdAt,
    defaultQuantity,
  }: Pick<
    ActionEntity,
    | "name"
    | "symbol"
    | "market"
    | "activitySector"
    | "price"
    | "isAvailable"
    | "createdAt"
    | "defaultQuantity"
  >):
    | ActionEntity
    | InvalidActionNameError
    | InvalidSymbolError
    | InvalidQuantityError {
    const validatedName = this.validateName(name);
    if (validatedName instanceof Error) return validatedName;

    const validatedSymbol = this.validateSymbol(symbol);
    if (validatedSymbol instanceof Error) return validatedSymbol;

    const validatedMarket = this.validateMarket(market);
    const validatedActivitySector = this.validateActivitySector(activitySector);
    if (this.validateDefaultQuantity(defaultQuantity))
      return new InvalidQuantityError(defaultQuantity);

    return new ActionEntity(
      ISIN.generate(),
      validatedName,
      validatedSymbol,
      validatedMarket,
      validatedActivitySector,
      price,
      isAvailable,
      createdAt,
      createdAt,
      defaultQuantity
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
    defaultQuantity,
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
    | "defaultQuantity"
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
      updatedAt,
      defaultQuantity
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
    symbol,
    market,
    activitySector,
    isAvailable,
    now,
  }: {
    name?: string;
    symbol?: string;
    market?: string;
    activitySector?: string;
    isAvailable?: boolean;
    now: Date;
  }) {
    if (name) this.name = name;
    if (symbol) this.symbol = symbol;
    if (market) this.market = market;
    if (activitySector) this.activitySector = activitySector;
    if (isAvailable !== undefined) {
      isAvailable ? this.enable({ now }) : this.disable({ now });
    }
  }

  /**
   * Diminue la quantité disponible sur le marché primaire
   */
  decreaseAvailableQuantity(
    quantity: number,
    now: Date
  ): ActionEntity | InvalidQuantityError {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return new InvalidQuantityError(quantity);
    }

    if (quantity > this.defaultQuantity) {
      return new InvalidQuantityError(quantity);
    }

    return new ActionEntity(
      this.ISIN,
      this.name,
      this.symbol,
      this.market,
      this.activitySector,
      this.price,
      this.isAvailable,
      this.createdAt,
      now,
      this.defaultQuantity - quantity
    );
  }

  public toDTO(): ActionDTO {
    return {
      ISIN: this.ISIN.getValue(),
      name: this.name,
      activitySector: this.activitySector,
      symbol: this.symbol,
      market: this.market,
      price: this.price,
      isAvailable: this.isAvailable,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      defaultQuantity: this.defaultQuantity,
    };
  }
}

export type ActionDTO = {
  ISIN: string;
  createdAt: string;
  updatedAt: string;
} & Pick<
  ActionEntity,
  | "activitySector"
  | "name"
  | "symbol"
  | "market"
  | "price"
  | "isAvailable"
  | "defaultQuantity"
>;
