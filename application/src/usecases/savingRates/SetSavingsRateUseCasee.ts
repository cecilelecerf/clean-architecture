import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import {
  SavingsRateDTO,
  SavingsRateEntity,
} from "@domain/entities/SavingsRateEntity";
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
import { EffectiveDateInPastError } from "@domain/errors/savingsRate";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { EmailService } from "@application/ports/services/EmailService";

interface Props {
  rate: number;
  effectiveDate: string;
  userId: string;
}

export class SetSavingsRateUsecase {
  public constructor(
    private readonly configRepository: SavingRateRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
    private readonly emailService: EmailService,
  ) {}

  public async execute({
    rate,
    effectiveDate,
    userId,
  }: Props): Promise<
    | SavingsRateDTO
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | InvalidPercentageError
    | EffectiveDateInPastError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], user.role);

    const percentage = Percentage.create(rate);
    if (percentage instanceof Error) {
      return percentage;
    }

    const effectiveDateResult = this.clockService.toDate(effectiveDate);
    const today = this.clockService.now();

    const savingsRate = SavingsRateEntity.create({
      id: this.uuidService.generate(),
      rate: percentage,
      effectiveDate: effectiveDateResult,
      createdAt: today,
    });
    if (savingsRate instanceof Error) return savingsRate;

    await this.configRepository.save(savingsRate);

    const accounts = await this.accountRepository.findAllSavingsAccounts();
    const userIds = [
      ...new Set(
        accounts
          .map(a => a.userId)
          .filter((id): id is string => typeof id === "string")
      ),
    ];

    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(effectiveDateResult);

    for (const accountUserId of userIds) {
      const accountUser = await this.userRepository.findById(accountUserId);
      if (!accountUser || !accountUser.isActive()) continue;

      await this.emailService.sendEmail({
        to: accountUser.email,
        subject: "Modification du taux d'épargne",
        text: `Le taux d'épargne sera de ${percentage.value} % à partir du ${formattedDate}.`,
      });
    }

    return savingsRate.toDTO();
  }
}
