import { Money } from "@domain/values/Money";

export class ActionEntity {
  private constructor(
    public ISIN: string,
    public name: string,
    public totalNb: number,
    public symbol: string,
    public market: string,
    public activitySector: string,
    public currentPrice: Money,
    public isAvailable: boolean,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}

  public static from({
    ISIN,
    name,
    totalNb,
    symbol,
    market,
    activitySector,
    currentPrice,
    isAvailable,
    createdAt,
    updatedAt,
  }: Pick<
    ActionEntity,
    | "ISIN"
    | "name"
    | "totalNb"
    | "symbol"
    | "market"
    | "activitySector"
    | "currentPrice"
    | "isAvailable"
    | "createdAt"
    | "updatedAt"
  >) {
    return new ActionEntity(
      ISIN,
      name,
      totalNb,
      symbol,
      market,
      activitySector,
      currentPrice,
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

  public updatePrice({ newPrice, now }: { newPrice: Money; now: Date }): void {
    this.currentPrice = newPrice;
    this.updatedAt = now;
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
    if (totalNb) this.totalNb = totalNb;
    if (symbol) this.symbol = symbol;
    if (market) this.market = market;
    if (activitySector) this.activitySector = activitySector;
    if (price) this.currentPrice = price;
    if (isAvailable !== undefined) {
      isAvailable ? this.enable({ now }) : this.disable({ now });
    }
  }
}
