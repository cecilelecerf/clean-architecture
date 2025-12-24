import { UserNotActiveError, UserNotFoundError, UserRoleMismatchError } from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMissingError } from "@domain/errors/money";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";
import { InvalidPercentageError } from "@domain/errors/percentage";
import { InvalidCreditDurationError } from "@domain/errors/credit";

type Props = {
  clientId: UserEntity["id"];
  amount: number;
  interestRate: number;
  insuranceRate: number;
  currency: string;
} & Pick<CreditEntity, "durationMonths">;

export class RequestCreditUsecase {
    constructor(
        private readonly creditRepository: CreditRepository,
        private readonly userRepository: UserRepository,
        private readonly uuidService: UuidService,
        private readonly clockService: ClockService
    ){}

    public async execute({
        clientId,
        amount,
        currency,
        insuranceRate,
        interestRate,
        durationMonths
    }: Props): Promise<
    | CreditEntity
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | InvalidPercentageError
    | InvalidCreditDurationError
    >{
        const client = await findActiveUser(this.userRepository, clientId);
        if (client instanceof Error) return client;
        if (!client.hasRole({ role: "client" }))
            return new UserRoleMismatchError(["client"], client.role);

        const initialAmountVO = Money.create({ amount: amount, currency });
        if (initialAmountVO instanceof Error) return initialAmountVO;
        
        const insuranceRateVO = Percentage.create(insuranceRate);
        if (insuranceRateVO instanceof Error) return insuranceRateVO;
        
        const interestRateVO = Percentage.create(interestRate);
        if (interestRateVO instanceof Error) return interestRateVO;

        const credit = CreditEntity.create({
            id: this.uuidService.generate(),
            advisorId: null,
            userId: clientId,
            initialAmount: initialAmountVO,
            interestRate: insuranceRateVO,
            insuranceRate: interestRateVO,
            durationMonths,
            startDate: this.clockService.now(),
            status: CreditStatus.PENDING
        });

        if (credit instanceof Error) return credit;

        await this.creditRepository.save(credit);
        return credit;
    }
}