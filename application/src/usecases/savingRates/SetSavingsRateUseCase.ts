import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { Percentage } from "@domain/values/Percentage";
import { findActiveUser } from "@application/utils/userValidators";
import { UserRepository } from "@application/ports/repositories/UserRepository";
 import { UuidService } from "@application/ports/services/UuidService";
import { UserNotFoundError,UserNotActiveError,UserRoleMismatchError } from "@application/errors/users";
 import { InvalidPercentageError } from "@domain/errors/percentage";

// TODO: je pense que pour la Date il ne faut pas récup un type Date
interface Props {
  rate : number;
  effectiveDate : Date;
  userId: string;
}

export class SetSavingsRateUsecase {
  public constructor(
    private readonly configRepository: SavingRateRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService
  ) {}

  // Enregistrement du taux d'interêt que pour les user ayant le rôle de directeur
  public async execute({
    rate,
    effectiveDate,
    userId
  }: Props): Promise<
      | UserRoleMismatchError
      | UserNotFoundError
      | UserNotActiveError
      | InvalidPercentageError
      | void
    > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    // TODO : attention le rôle conseiller existe
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["directeur"], user.role);

    const percentage = Percentage.create(rate);
    if (percentage instanceof Error) {
      return percentage;
    }
// TODO : use service
    const savingsRate = SavingsRateEntity.from({
      id: this.uuidService.generate(),
      rate: percentage,
      effectiveDate: effectiveDate,
    });

    await this.configRepository.save(savingsRate);
  }
}
