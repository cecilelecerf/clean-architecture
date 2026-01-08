import { ActionEntity } from "./ActionEntity";
import { OrderEntity } from "./OrderEntity";

export class PortfolioPositionEntity {
  private constructor(
    public ISIN: ActionEntity["ISIN"],
    public symbol: ActionEntity["symbol"],
    public name: ActionEntity["name"],
    public quantity: OrderEntity["quantity"],
    public averagePrice: number,
    public currentPrice: number,
    public currency: string,
    public totalInvested: number,
    public currentValue: number,
    public gainLoss: number,
    public gainLossPercent: number
  ) {}

  public static create({
    name,
    ISIN,
    symbol,
    orders,
    price: { amount, currency },
  }: { orders: OrderEntity[] } & Pick<
    ActionEntity,
    "name" | "ISIN" | "symbol" | "price"
  >) {
    let totalQuantity = 0;
    let totalInvested = 0;
    for (const order of orders) {
      if (order.status !== "executed") continue;
      if (order.type === "buy") {
        totalQuantity += order.quantity;
        totalInvested = totalInvested + order.price.amount * order.quantity;
      } else if (order.type === "sell") {
        totalQuantity -= order.quantity;
        const avgPrice = totalInvested / (totalQuantity + order.quantity);
        totalInvested -= avgPrice * order.quantity;
      }
    }
    if (totalQuantity <= 0) {
      return new PortfolioPositionEntity(
        ISIN,
        symbol,
        name,
        totalQuantity,
        0,
        0,
        currency,
        0,
        0,
        0,
        0
      );
    }

    const averagePrice = totalInvested / totalQuantity;
    const currentPrice = amount;
    const currentValue = totalQuantity * currentPrice;
    const gainLoss = currentValue - totalInvested;
    const gainLossPercent =
      totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

    return new PortfolioPositionEntity(
      ISIN,
      symbol,
      name,
      totalQuantity,
      Math.round(averagePrice * 100) / 100,
      Math.round(currentPrice * 100) / 100,
      currency,
      Math.round(totalInvested * 100) / 100,
      Math.round(currentValue * 100) / 100,
      Math.round(gainLoss * 100) / 100,
      Math.round(gainLossPercent * 100) / 100
    );
  }
  public toDTO(): PortfolioPositionDTO {
    return {
      ISIN: this.ISIN.getValue(),
      name: this.name,
      quantity: this.quantity,
      averagePrice: this.averagePrice,
      currentPrice: this.currentPrice,
      currency: this.currency,
      totalInvested: this.totalInvested,
      currentValue: this.currentValue,
      gainLoss: this.gainLoss,
      gainLossPercent: this.gainLossPercent,
      symbol: this.symbol,
    };
  }
}
export type PortfolioPositionDTO = { ISIN: string } & Pick<
  PortfolioPositionEntity,
  | "symbol"
  | "name"
  | "quantity"
  | "averagePrice"
  | "currentPrice"
  | "currency"
  | "totalInvested"
  | "currentValue"
  | "gainLoss"
  | "gainLossPercent"
>;
