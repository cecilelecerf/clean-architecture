export class ActionEntity {
  private constructor(
    public ISIN: string,
    public name: string,
    public symbol: string,
    public market: string,
    public activitySector: string,
    public currentPrice: number,
    public isAvailable: boolean,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}

  public static from({ ISIN, name, symbol, market, activitySector, currentPrice, isAvailable, createdAt, updatedAt}: { ISIN: string, name: string, symbol: string, market: string, activitySector: string, currentPrice: number, isAvailable: boolean, createdAt: Date, updatedAt?: Date }) {
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
}