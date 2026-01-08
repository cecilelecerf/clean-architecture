import { ActionNotFoundError } from "@application/errors/actions";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { ActionDTO, ActionEntity } from "@domain/entities/ActionEntity";
import { InvalidISINError } from "@domain/errors/ISIN";
import { ISIN } from "@domain/values/ISIN";

interface Props {
  userId: string;
  isin: string;
}

export class GetActionUsecase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
    isin,
  }: Props): Promise<
    | ActionDTO
    | ActionNotFoundError
    | UserNotFoundError
    | UserNotActiveError
    | InvalidISINError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const validateIsin = ISIN.isValid(isin);
    if (validateIsin instanceof Error) return validateIsin;
    const action = await this.actionRepository.findByISIN(validateIsin);
    if (!action) return new ActionNotFoundError();
    return action.toDTO();
  }
}
