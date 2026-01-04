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
import { ActionNotFoundError } from "@application/errors/actions";

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

type Props = {
  userId: UserEntity["id"];
  isin: string;
};

export class GetUserPositionByISINUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute({
    userId,
    isin,
  }: Props): Promise<
    | PortfolioPosition
    | null
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | ActionNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);

    const action = await this.actionRepository.findByISIN(isin);
    if (!action) return new ActionNotFoundError();

    const userOrders = await this.orderRepository.findByUserIdAndStatus(
      userId,
      "executed"
    );

    const actionOrders = userOrders.filter((order) => order.actionId === isin);

    if (actionOrders.length === 0) {
      return null;
    }

    let totalQuantity = 0;
    let totalInvested = 0;

    for (const order of actionOrders) {
      if (order.type === "buy") {
        totalQuantity += order.quantity;
        totalInvested += order.price.amount * order.quantity;
      } else if (order.type === "sell") {
        totalQuantity -= order.quantity;
        const avgPrice = totalInvested / (totalQuantity + order.quantity);
        totalInvested -= avgPrice * order.quantity;
      }
    }

    if (totalQuantity <= 0) {
      return null;
    }

    const averagePrice = totalInvested / totalQuantity;
    const currentPrice = action.currentPrice.amount;
    const currentValue = totalQuantity * currentPrice;
    const gainLoss = currentValue - totalInvested;
    const gainLossPercent =
      totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

    return {
      isin: action.ISIN,
      symbol: action.symbol,
      name: action.name,
      quantity: totalQuantity,
      averagePrice: Math.round(averagePrice * 100) / 100,
      currentPrice: Math.round(currentPrice * 100) / 100,
      currency: action.currentPrice.currency,
      totalInvested: Math.round(totalInvested * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      gainLoss: Math.round(gainLoss * 100) / 100,
      gainLossPercent: Math.round(gainLossPercent * 100) / 100,
    };
  }
}
