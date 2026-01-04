import { ActionNotFoundError } from "@application/errors/actions";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { ActionEntity } from "@domain/entities/ActionEntity";

interface Props {
  userId: string;
  ISIN: string;
}

export class GetActionUsecase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
    ISIN,
  }: Props): Promise<
    ActionEntity | ActionNotFoundError | UserNotFoundError | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    const action = await this.actionRepository.findByISIN(ISIN);
    if (!action) return new ActionNotFoundError();
    return action;
  }
}
