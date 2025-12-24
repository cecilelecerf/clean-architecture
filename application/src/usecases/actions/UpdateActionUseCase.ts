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
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { Money } from "@domain/values/Money";

interface Props {
  userId: string;
  ISIN: string;
  name?: string;
  totalNb?: number;
  symbol?: string;
  market?: string;
  activitySector?: string;
  priceAmount?: number;
  priceCurrency?: string;
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
    ISIN,
    name,
    totalNb,
    symbol,
    market,
    activitySector,
    priceAmount,
    priceCurrency,
    isAvailable,
  }: Props): Promise<
    | void
    | ActionNotFoundError
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (
      user.hasRole({ role: "client" }) ||
      user.hasRole({ role: "conseiller" })
    )
      return new UserRoleMismatchError(["directeur"], user.role);

    const action = await this.actionRepository.findByISIN(ISIN);
    if (!action) return new ActionNotFoundError();

    let price;
    if (priceAmount && priceCurrency) {
      price = Money.create({ amount: priceAmount, currency: priceCurrency });
      if (price instanceof Error) return price;
    }

    action.update({
      name,
      totalNb,
      symbol,
      market,
      activitySector,
      price,
      isAvailable,
      now: this.clockService.now(),
    });
  }
}
