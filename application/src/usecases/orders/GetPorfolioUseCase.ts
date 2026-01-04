// @application/usecases/portfolio/GetUserPortfolioUseCase.ts
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";
import { findActiveUser } from "@application/utils/userValidators";
import {
  UserNotFoundError,
  UserNotActiveError,
  UserRoleMismatchError,
} from "@application/errors/users";

type PortfolioPosition = {
  isin: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
};

type Portfolio = {
  positions: PortfolioPosition[];
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  currency: string;
};

type Props = {
  userId: UserEntity["id"];
};

export class GetPortfolioUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute({
    userId,
  }: Props): Promise<
    Portfolio | UserNotFoundError | UserNotActiveError | UserRoleMismatchError
  > {
    console.log(userId);
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);

    const executedOrders = await this.orderRepository.findByUserIdAndStatus(
      userId,
      "executed"
    );
    console.log(executedOrders);

    const positionsMap = new Map<
      string,
      {
        quantity: number;
        totalInvested: number;
        transactions: Array<{ quantity: number; price: number }>;
      }
    >();

    for (const order of executedOrders) {
      const existing = positionsMap.get(order.actionId) || {
        quantity: 0,
        totalInvested: 0,
        transactions: [],
      };

      if (order.type === "buy") {
        existing.quantity += order.quantity;
        existing.totalInvested += order.price.amount * order.quantity;
        existing.transactions.push({
          quantity: order.quantity,
          price: order.price.amount,
        });
      } else if (order.type === "sell") {
        existing.quantity -= order.quantity;
        const avgPrice =
          existing.totalInvested / (existing.quantity + order.quantity);
        existing.totalInvested -= avgPrice * order.quantity;
      }

      positionsMap.set(order.actionId, existing);
    }

    for (const [isin, position] of positionsMap.entries()) {
      if (position.quantity <= 0) {
        positionsMap.delete(isin);
      }
    }

    const positions: PortfolioPosition[] = [];
    let defaultCurrency = "EUR";

    for (const [isin, position] of positionsMap.entries()) {
      const action = await this.actionRepository.findByISIN(isin);
      if (!action) continue;
      console.log(position);
      const currentPrice = action.currentPrice.amount;
      const averagePrice = position.totalInvested / position.quantity;
      const currentValue = position.quantity * currentPrice;
      const gainLoss = currentValue - position.totalInvested;
      const gainLossPercent =
        position.totalInvested > 0
          ? (gainLoss / position.totalInvested) * 100
          : 0;

      defaultCurrency = action.currentPrice.currency;

      positions.push({
        isin: action.ISIN,
        symbol: action.symbol,
        name: action.name,
        quantity: position.quantity,
        averagePrice: Math.round(averagePrice * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100,
        currency: action.currentPrice.currency,
        totalInvested: Math.round(position.totalInvested * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        gainLoss: Math.round(gainLoss * 100) / 100,
        gainLossPercent: Math.round(gainLossPercent * 100) / 100,
      });
    }

    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalInvested = positions.reduce(
      (sum, p) => sum + p.totalInvested,
      0
    );
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent =
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    positions.sort((a, b) => b.currentValue - a.currentValue);

    return {
      positions,
      totalValue: Math.round(totalValue * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalGainLoss: Math.round(totalGainLoss * 100) / 100,
      totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
      currency: defaultCurrency,
    };
  }
}
