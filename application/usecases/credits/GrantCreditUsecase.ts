import { InvalidCreditDurationError } from "@application/errors/credits/InvalidCreditDurationError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { CreditAmortizationService } from "@application/ports/services/CreditAmortizationService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { MoneyAmountInvalidError } from "@domain/errors/money/MoneyAmountInvalidError";
import { MoneyAmountNegativeError } from "@domain/errors/money/MoneyAmountNegativeError";
import { MoneyCurrencyMissingError } from "@domain/errors/money/MoneyCurrencyMissingError";
import { InvalidPercentageError } from "@domain/errors/percentage/InvalidPercentageError";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

type Props = {
  clientId: UserEntity["id"];
  actorId: UserEntity["id"];
  principal: number;
  interestRate: number;
  insuranceRate: number;
  currency: string;
} & Pick<CreditEntity, "durationMonths">;

export class GrantCreditUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService,
    private readonly creadiAmortizationService: CreditAmortizationService,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    clientId,
    actorId,
    principal,
    currency,
    insuranceRate,
    interestRate,
    durationMonths,
  }: Props): Promise<
    | CreditEntity
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | InvalidCreditDurationError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | InvalidPercentageError
  > {
    const actor = await findActiveUser(this.userRepository, actorId);
    if (actor instanceof Error) return actor;
    if (!actor.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], actor.role);

    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;
    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);

    const initialAmountVO = Money.create(principal, currency);
    if (initialAmountVO instanceof Error) return initialAmountVO;

    const insuranceRateVO = Percentage.create(insuranceRate);
    if (insuranceRateVO instanceof Error) return insuranceRateVO;
    const interestRateVO = Percentage.create(interestRate);
    if (interestRateVO instanceof Error) return interestRateVO;

    const id = this.uuidService.generate();

    if (
      !(durationMonths > 0) ||
      !Number.isInteger(durationMonths) ||
      durationMonths > 400
    )
      return new InvalidCreditDurationError(durationMonths);

    const monthlyPayment =
      await this.creadiAmortizationService.calculateSchedule(
        initialAmountVO,
        interestRateVO,
        insuranceRateVO,
        durationMonths
      );
    if (monthlyPayment instanceof Error) return monthlyPayment;

    const startDate = this.clockService.now();

    const credit = CreditEntity.from({
      id,
      userId: clientId,
      insuranceRate: insuranceRateVO,
      interestRate: interestRateVO,
      initialAmount: initialAmountVO,
      durationMonths,
      monthlyPayment,
      startDate,
      remainingBalance: initialAmountVO,
    });

    await this.creditRepository.save(credit);
    return credit;
  }
}
