import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { OrderEntity } from "@domain/entities/OrderEntity";

export class GetAllByUserUseCase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  public async execute(
    userId: string
  ): Promise<OrderEntity[] | UserNotFoundError | UserNotActiveError> {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    return this.orderRepository.findAllByUserId(userId);
  }
}
