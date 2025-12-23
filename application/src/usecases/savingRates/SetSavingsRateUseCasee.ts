import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { SavingsRateDTO, SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { Percentage } from "@domain/values/Percentage";
import { findActiveUser } from "@application/utils/userValidators";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UuidService } from "@application/ports/services/UuidService";
import {
  UserNotFoundError,
  UserNotActiveError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { InvalidPercentageError } from "@domain/errors/percentage";
import { ClockService } from "@application/ports/services/ClockService";
import { SavingsRateDTOMapper } from "@application/dto/SavingsrateDTOMapper";

interface Props {
  rate: number;
  effectiveDate: string;
  userId: string;
}

export class SetSavingsRateUsecase {
  public constructor(
    private readonly configRepository: SavingRateRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}

  // Enregistrement du taux d'interêt que pour les user ayant le rôle de directeur
  public async execute({
    rate,
    effectiveDate,
    userId,
  }: Props): Promise<
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | InvalidPercentageError
    | SavingsRateDTO
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    if (
      user.hasRole({ role: "client" }) ||
      user.hasRole({ role: "conseiller" })
    )
      return new UserRoleMismatchError(["directeur"], user.role);

    const percentage = Percentage.create(rate);
    if (percentage instanceof Error) {
      return percentage;
    }

    const effectiveDateResult = this.clockService.toDate(effectiveDate);

    const today = this.clockService.now();

    const savingsRate = SavingsRateEntity.from({
      id: this.uuidService.generate(),
      rate: percentage,
      effectiveDate: effectiveDateResult,
      createdAt: today,
      updatedAt: today,
    });

    await this.configRepository.save(savingsRate);

    return SavingsRateDTOMapper.toDTO(savingsRate);
  }
}
