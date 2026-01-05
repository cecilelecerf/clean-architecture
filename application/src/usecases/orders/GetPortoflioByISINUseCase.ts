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
import { PortfolioPositionEntity } from "@domain/entities/PortfolioEntity";

type Props = {
  userId: UserEntity["id"];
  isin: string;
};

export class GetPortoflioByISINUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute({
    userId,
    isin,
  }: Props): Promise<
    | PortfolioPositionEntity
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

    const actionOrders = await this.orderRepository.findAllByActionIdAndStatus(
      isin,
      "executed"
    );

    return PortfolioPositionEntity.create({ ...action, orders: actionOrders });
  }
}
