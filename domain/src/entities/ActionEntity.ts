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
  public enable(): void {
    this.isAvailable = true;
    this.updatedAt = new Date();
  }

  public disable(): void {
    this.isAvailable = false;
    this.updatedAt = new Date();
  }

  public updatePrice(newPrice: Money): void {
    this.currentPrice = newPrice;
    this.updatedAt = new Date();
  }

  update(props: {
    name?: string;
    totalNb?: number;
    symbol?: string;
    market?: string;
    activitySector?: string;
    price?: Money;
    isAvailable?: boolean;
  }) {
    if (props.name) this.name = props.name;
    if (props.totalNb) this.totalNb = props.totalNb;
    if (props.symbol) this.symbol = props.symbol;
    if (props.market) this.market = props.market;
    if (props.activitySector) this.activitySector = props.activitySector;
    if (props.price) this.currentPrice = props.price;
    if (props.isAvailable !== undefined) {
      props.isAvailable ? this.enable() : this.disable();
    }
  }

}
