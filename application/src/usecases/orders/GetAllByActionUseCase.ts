import { ActionNotFoundError } from "@application/errors/actions";
import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { OrderEntity } from "@domain/entities/OrderEntity";

export class GetAllByActionUseCase {
    public constructor(
        private readonly userRepository: UserRepository,
        private readonly orderRepository: OrderRepository,
        private readonly actionRepository: ActionRepository,
    ) {}

    public async execute(userId : string, actionId : string): Promise <
    | OrderEntity[]
    | UserNotFoundError 
    | UserNotActiveError
    | ActionNotFoundError
    >{
        const user = await findActiveUser(this.userRepository, userId);
        if (user instanceof Error) return user;

        const action = await this.actionRepository.findByISIN(actionId);
        if (!action) return new ActionNotFoundError;

        return this.orderRepository.findAllByActionId(actionId);
    }
}