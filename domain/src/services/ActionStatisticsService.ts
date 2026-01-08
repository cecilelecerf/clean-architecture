import { OrderEntity } from "@domain/entities/OrderEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { Money } from "@domain/values/Money";

export class ActionStatisticsService {
  /**
   * Calcule la variation de prix entre deux périodes
   */
  static calculatePriceChangePercent(
    currentPrice: Money,
    oldPrice: Money
  ): number | Error {
    if (currentPrice.currency !== oldPrice.currency) {
      return new Error("Currency mismatch");
    }

    if (oldPrice.amount === 0) return 0;

    const change =
      ((currentPrice.amount - oldPrice.amount) / oldPrice.amount) * 100;
    return Math.round(change * 100) / 100;
  }

  /**
   * Extrait le prix le plus ancien d'une liste d'ordres
   */
  static getOldestPrice(orders: OrderEntity[]): Money | null {
    if (orders.length === 0) return null;

    const oldestOrder = orders[0]; // Supposant que les ordres sont triés par date ASC
    return oldestOrder.executionPrice ?? oldestOrder.price;
  }

  /**
   * Calcule les statistiques d'un ensemble d'ordres
   */
  static calculateOrderStatistics(
    orders: OrderEntity[],
    action: ActionEntity
  ): {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    totalVolume: number;
    transactionCount: number;
  } {
    if (orders.length === 0) {
      return {
        minPrice: action.price.amount,
        maxPrice: action.price.amount,
        averagePrice: action.price.amount,
        totalVolume: 0,
        transactionCount: 0,
      };
    }

    const prices = orders.map(
      (order) => (order.executionPrice ?? order.price).amount
    );

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      totalVolume: orders.reduce((sum, order) => sum + order.quantity, 0),
      transactionCount: orders.length,
    };
  }

  /**
   * Calcule la volatilité (variation absolue moyenne)
   */
  static calculateVolatility(orders: OrderEntity[]): number {
    if (orders.length < 2) return 0;

    const prices = orders.map(
      (order) => (order.executionPrice ?? order.price).amount
    );

    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const change =
        Math.abs((prices[i] - prices[i - 1]) / prices[i - 1]) * 100;
      changes.push(change);
    }

    const avgVolatility =
      changes.reduce((sum, c) => sum + c, 0) / changes.length;
    return Math.round(avgVolatility * 100) / 100;
  }
}
