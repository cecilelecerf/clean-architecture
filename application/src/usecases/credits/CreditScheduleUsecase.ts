import {
  CreditNotBelongsToClientError,
  CreditNotFoundError,
} from "@application/errors/credits";
import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity, MonthlySchedule } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { InsufficientFundsError } from "@domain/errors/account";
import { CreditAlreadyPaidError } from "@domain/errors/credit";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";

type Props = {
  clientId: UserEntity["id"];
  creditId: CreditEntity["id"];
};

export class CreditScheduleUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository,
    private readonly formuleRepository: FormuleCreditRepository
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
    | FormuleCreditNotFoundError
    | InsufficientFundsError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;
    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);

    const credit = await this.creditRepository.findById(creditId);
    if (!credit) return new CreditNotFoundError();

    const creditUser = await this.userRepository.findByIban(credit.accountId);
    if (!creditUser) return new UserNotFoundError();

    if (creditUser.id !== client.id)
      return new CreditNotBelongsToClientError(credit.id, client.id);

    const formuleCredit = await this.formuleRepository.findById(
      credit.formuleCreditId
    );
    if (!formuleCredit) return new FormuleCreditNotFoundError();

    const monthlySchedule = credit.calculateAmortizationSchedule(
      formuleCredit.interestRate,
      formuleCredit.insuranceRate
    );
    return monthlySchedule;
  }
}
