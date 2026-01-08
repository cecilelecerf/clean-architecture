import { InvalidOrderAccessError } from "@application/errors/orders/InvalidOrderAccessError";
import { OrderNotFoundError } from "@application/errors/orders/OrderNotFoundError";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { OrderToDTO } from "@domain/entities/OrderEntity";
type Props = {
  userId: string;
  orderId: string;
};
export class CancelledOrderUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    userId,
    orderId,
  }: Props): Promise<
    | OrderToDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | OrderNotFoundError
    | InvalidOrderAccessError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);

    const order = await this.orderRepository.findByIdWithAccount(orderId);
    if (!order) return new OrderNotFoundError();
    if (order.account.userId !== user.id)
      return new InvalidOrderAccessError(user.id, order.id);
    order.markCancelled({ now: this.clockService.now() });
    await this.orderRepository.update(order);
    return order.toDTO();
  }
}
