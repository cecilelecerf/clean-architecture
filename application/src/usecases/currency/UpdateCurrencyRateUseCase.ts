import { CurrencyNotFoundError } from "@application/errors/currency";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { CurrencyToDTO } from "@domain/entities/CurrencyEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { InvalidExchangeRateError } from "@domain/errors/currency";

type Props = {
  code: string;
  newRate: number;
  actorId: UserEntity["id"];
};

export class UpdateCurrencyRateUseCase {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly userRepo: UserRepository,
    private readonly clockService: ClockService
  ) {}

  async execute({
    code,
    newRate,
    actorId,
  }: Props): Promise<
    | CurrencyToDTO
    | InvalidExchangeRateError
    | CurrencyNotFoundError
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const actor = await findActiveUser(this.userRepo, actorId);
    if (actor instanceof Error) return actor;

    if (!actor.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], actor.role);

    const currency = await this.currencyRepository.findByCode(code);
    if (!currency) {
      return new CurrencyNotFoundError(code);
    }

    const updated = currency.updateExchangeRate({
      newRate,
      now: this.clockService.now(),
    });

    if (updated instanceof Error) {
      return updated;
    }

    await this.currencyRepository.update(currency);

    return currency.toDTO();
  }
}
