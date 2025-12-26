import { ActionNotFoundError } from "@application/errors/actions";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { OrderEntity } from "@domain/entities/OrderEntity";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import {
  InvalidOrderTypeError,
  InvalidQuantityError,
} from "@domain/errors/order";

interface Props {
  userId: string;
  actionId: string;
  type: "buy" | "sell";
  quantity: number;
}
export class PlaceOrderUseCase {
  public constructor(
    private readonly orderRepository: OrderRepository,
    private readonly actionRepository: ActionRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    userId,
    actionId,
    type,
    quantity,
  }: Props): Promise<
    | ActionNotFoundError
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | InvalidQuantityError
    | InvalidOrderTypeError
    | void
  > {
    const action = await this.actionRepository.findByISIN(actionId);
    if (!action) return new ActionNotFoundError();

    const today = this.clockService.now();

    const order = OrderEntity.create({
      id: this.uuidService.generate(),
      userId,
      actionId: action.ISIN,
      type,
      quantity,
      price: action.currentPrice,
      date: today,
      createdAt: today,
    });

    if (order instanceof Error) {
      return order;
    }

    await this.orderRepository.save(order);
  }
}
