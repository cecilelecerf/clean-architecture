import { ActionNotFoundError } from "@application/errors/actions";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { ActionDTO, ActionEntity } from "@domain/entities/ActionEntity";
import { InvalidISINError } from "@domain/errors/ISIN";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { ISIN } from "@domain/values/ISIN";

interface Props {
  userId: string;
  isin: string;
  name?: string;
  symbol?: string;
  market?: string;
  activitySector?: string;
  isAvailable?: boolean;
}

export class UpdateActionUsecase {
  public constructor(
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    userId,
    isin,
    name,
    symbol,
    market,
    activitySector,
    isAvailable,
  }: Props): Promise<
    | ActionDTO
    | ActionNotFoundError
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | InvalidISINError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (
      user.hasRole({ role: "client" }) ||
      user.hasRole({ role: "conseiller" })
    )
      return new UserRoleMismatchError(["directeur"], user.role);

    const validateIsin = ISIN.isValid(isin);
    if (validateIsin instanceof Error) return validateIsin;
    const action = await this.actionRepository.findByISIN(validateIsin);
    if (!action) return new ActionNotFoundError();

    action.update({
      name,
      symbol,
      market,
      activitySector,
      isAvailable,
      now: this.clockService.now(),
    });

    await this.actionRepository.update(action);
    return action.toDTO();
  }
}
