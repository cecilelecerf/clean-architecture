import { CurrencyAlreadyExistsError } from "@application/errors/currency";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { CurrencyEntity, CurrencyToDTO } from "@domain/entities/CurrencyEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import {
  InvalidCurrencyCodeError,
  InvalidExchangeRateError,
} from "@domain/errors/currency";

type Props = {
  code: string;
  exchangeRate: number;
  actorId: UserEntity["id"];
};

export class CreateCurrencyUseCase {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly userRepo: UserRepository,
    private readonly clockService: ClockService
  ) {}

  async execute({
    code,
    exchangeRate,
    actorId,
  }: Props): Promise<
    | CurrencyToDTO
    | InvalidCurrencyCodeError
    | InvalidExchangeRateError
    | CurrencyAlreadyExistsError
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const actor = await findActiveUser(this.userRepo, actorId);
    if (actor instanceof Error) return actor;

    if (!actor.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], actor.role);
    const existing = await this.currencyRepository.findByCode(code);
    if (existing) {
      return new CurrencyAlreadyExistsError(existing.code);
    }

    const currency = CurrencyEntity.create({
      code: code,
      exchangeRate: exchangeRate,
      createdAt: this.clockService.now(),
    });

    if (currency instanceof Error) {
      return currency;
    }

    await this.currencyRepository.save(currency);

    return currency.toDTO();
  }
}
