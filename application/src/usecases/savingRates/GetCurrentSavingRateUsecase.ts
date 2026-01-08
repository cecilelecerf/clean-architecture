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
import { ClockService } from "@application/ports/services/ClockService";
import { SavingsRateNotFoundError } from "@application/errors/savingsRate/SavingsRateNotFoundError";
type Props = { userId: UserEntity["id"] };

export class GetCurrentSavingRateUsecase {
  constructor(
    private readonly savingRateRepository: SavingRateRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}
  async execute({
    userId,
  }: Props): Promise<
    | SavingsRateDTO
    | null
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | SavingsRateNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const savingRate = await this.savingRateRepository.findRateAtDate(
      this.clockService.now()
    );

    if (!savingRate) return null;
    return savingRate.toDTO();
  }
}
