import { CreditNotBelongsToClientError } from "@application/errors/credits/CreditNotBelongsToClientError";
import { CreditNotFoundError } from "@application/errors/credits/CreditNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity, MonthlySchedule } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { CreditAlreadyPaidError } from "@domain/errors/credit/CreditAlreadyPaidError";
import { MoneyAmountInvalidError } from "@domain/errors/money/MoneyAmountInvalidError";
import { MoneyAmountNegativeError } from "@domain/errors/money/MoneyAmountNegativeError";
import { MoneyCurrencyMismatchError } from "@domain/errors/money/MoneyCurrencyMismatchError";
import { MoneyCurrencyMissingError } from "@domain/errors/money/MoneyCurrencyMissingError";
import { Money } from "@domain/values/Money";

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
    | UserNotFoundError
    | UserNotActiveError
    | MonthlySchedule[]
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
