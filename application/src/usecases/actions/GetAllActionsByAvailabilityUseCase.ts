import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { ActionDTO } from "@domain/entities/ActionEntity";

interface Props {
  userId: string;
  isAvailable: boolean;
}

export class GetAllActionsByAvailabilityUsecase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
    isAvailable,
  }: Props): Promise<ActionDTO[] | UserNotFoundError | UserNotActiveError> {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const actions = await this.actionRepository.findAllAvailable(
      user.hasRole({ role: "client" }) ? true : isAvailable
    );
    return actions.map((action) => action.toDTO());
  }
}
