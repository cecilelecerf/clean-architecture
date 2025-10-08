import { Money } from "@domain/values/Money";

export class ActionEntity {
  private constructor(
    public ISIN: string,
    public name: string,
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
    symbol,
    market,
    activitySector,
    currentPrice,
    isAvailable,
    createdAt,
    updatedAt,
  }: ActionEntity) {
    return new ActionEntity(
      ISIN,
      name,
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
}
