import { CurrencyNotFoundError } from "@application/errors/currency";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  code: string;
  actorId: UserEntity["id"];
};

export class DeleteCurrencyUseCase {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute({
    code,
    actorId,
  }: Props): Promise<
    | void
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

    await this.currencyRepository.delete(code);
  }
}
