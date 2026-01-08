import { AccountNotFoundError } from "@application/errors/accounts";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { ActionDTO, ActionEntity } from "@domain/entities/ActionEntity";
import {
  InvalidActionNameError,
  InvalidSymbolError,
  InvalidQuantityError,
} from "@domain/errors/action";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { Money } from "@domain/values/Money";
interface Props {
  userId: string;
  name: string;
  totalNb: number;
  symbol: string;
  market: string;
  activitySector: string;
  priceAmount: number;
  priceCurrency: string;
  isAvailable: boolean;
}

export class CreateActionUsecase {
  public constructor(
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService,
    private readonly accountRepository: AccountRepository
  ) {}

  // Création des actions que pour les user ayant le rôle de directeur
  public async execute({
    userId,
    name,
    totalNb,
    symbol,
    market,
    activitySector,
    priceAmount,
    priceCurrency,
    isAvailable,
  }: Props): Promise<
    | ActionDTO
    | UserRoleMismatchError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | UserNotFoundError
    | UserNotActiveError
    | InvalidActionNameError
    | InvalidSymbolError
    | InvalidQuantityError
    | AccountNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (!user.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], user.role);

    const price = Money.create({
      amount: priceAmount,
      currency: priceCurrency,
    });

    if (price instanceof Error) return price;

    const today = this.clockService.now();

    const action = ActionEntity.create({
      name,
      symbol,
      market,
      activitySector,
      price,
      isAvailable,
      createdAt: today,
      defaultQuantity: totalNb,
    });
    if (action instanceof Error) return action;

    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) return new AccountNotFoundError();

    await this.actionRepository.save(action);
    return action.toDTO();
  }
}
