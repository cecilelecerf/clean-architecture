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
import { PortfolioPositionEntity } from "@domain/entities/PortfolioEntity";

type Portfolio = {
  positions: PortfolioPositionEntity[];
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

    const executedOrders = await this.orderRepository.findAllByUserIdAndStatus(
      userId,
      "executed"
    );

    if (executedOrders.length === 0) {
      return {
        positions: [],
        totalValue: 0,
        totalInvested: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        currency: "EUR",
      };
    }

    const ordersByISIN = executedOrders.reduce((acc, order) => {
      if (!acc[order.ISIN]) {
        acc[order.ISIN] = [];
      }
      acc[order.ISIN].push(order);
      return acc;
    }, {} as Record<string, typeof executedOrders>);

    const positions: PortfolioPositionEntity[] = [];
    let defaultCurrency = "EUR";

    for (const [isin, orders] of Object.entries(ordersByISIN)) {
      const action = await this.actionRepository.findByISIN(isin);
      if (!action) continue;

      const position = PortfolioPositionEntity.create({
        ISIN: action.ISIN,
        symbol: action.symbol,
        name: action.name,
        price: action.price,
        orders,
      });

      if (position) {
        positions.push(position);
        defaultCurrency = position.currency;
      }
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
