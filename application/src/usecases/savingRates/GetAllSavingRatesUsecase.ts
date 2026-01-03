import {
  InvalidThreadAccessError,
  ThreadNotFoundError,
} from "@application/errors/threads";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { SavingsRateDTO } from "@domain/entities/SavingsRateEntity";
type Props = { userId: UserEntity["id"] };

export class GetAllSavingRatesUsecase {
  constructor(
    private readonly savingRateRepository: SavingRateRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    userId,
  }: Props): Promise<
    | SavingsRateDTO[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | InvalidThreadAccessError
    | ThreadNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (!user.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], user.role);
    const savingsRate = await this.savingRateRepository.findAll();
    return savingsRate.map((savingRate) => savingRate.toDTO());
  }
}
