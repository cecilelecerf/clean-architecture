import { CreditNotBelongsToClientError,CreditNotFoundError } from "@application/errors/credits";
import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity, MonthlySchedule } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity"; 
import { CreditAlreadyPaidError } from "@domain/errors/credit";
import { MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMismatchError, MoneyCurrencyMissingError } from "@domain/errors/money";
 
type Props = {
  clientId: UserEntity["id"];
  creditId: CreditEntity["id"];
};

export class CreditScheduleUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}
  public async execute({
    clientId,
    creditId,
  }: Props): Promise<
  | MonthlySchedule[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | CreditNotFoundError
    | CreditNotBelongsToClientError
    | MoneyCurrencyMissingError
    | CreditAlreadyPaidError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | MoneyCurrencyMismatchError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;
    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);

    const credit = await this.creditRepository.findById(creditId);

    if (!credit) return new CreditNotFoundError();
    if (credit.userId !== client.id)
      return new CreditNotBelongsToClientError(credit.id, client.id);

    const monthlySchedule = credit.calculateAmortizationSchedule();
    return monthlySchedule;
  }
}
