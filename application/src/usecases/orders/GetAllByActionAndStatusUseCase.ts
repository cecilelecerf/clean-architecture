import { ActionNotFoundError } from "@application/errors/actions";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { OrderEntity, OrderToDTO } from "@domain/entities/OrderEntity";
import { InvalidOrderStatusError } from "@domain/errors/order/InvalidOrderStatusError";
type Props = {
  userId: string;
  actionId: string;
  status?: string;
};
export class GetAllByActionAndStatusUseCase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
    private readonly actionRepository: ActionRepository
  ) {}

  public async execute({
    userId,
    actionId,
    status,
  }: Props): Promise<
    | OrderToDTO[]
    | UserNotFoundError
    | UserNotActiveError
    | ActionNotFoundError
    | InvalidOrderStatusError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    let validateStatus: undefined | OrderEntity["status"];
    if (status) {
      const s = OrderEntity.validateStatus(status);
      if (s instanceof Error) return s;
      validateStatus = s;
    }
    const action = await this.actionRepository.findByISIN(actionId);
    if (!action) return new ActionNotFoundError();

    const orders = await this.orderRepository.findAllByActionIdAndStatus(
      actionId,
      validateStatus
    );
    return orders.map((order) => order.toDTO());
  }
}
