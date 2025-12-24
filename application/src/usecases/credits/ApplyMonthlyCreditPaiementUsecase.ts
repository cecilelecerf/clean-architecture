import { CreditNotFoundError } from "@application/errors/credits";
import { UserNotActiveError, UserNotFoundError, UserRoleMismatchError } from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity } from "@domain/entities/CreditEntity"; 
import { UserEntity } from "@domain/entities/UserEntity";
import { CreditAlreadyPaidError } from "@domain/errors/credit";
import { MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMismatchError, MoneyCurrencyMissingError } from "@domain/errors/money";

type Props = {clientId: UserEntity["id"];} & Pick<CreditEntity, "id">;

export class ApplyMonthlyCreditPaiementUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    clientId,
    id,
  }: Props): Promise<
    | CreditEntity
    | CreditNotFoundError
    | CreditAlreadyPaidError
    | MoneyCurrencyMissingError
    | MoneyCurrencyMismatchError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | UserNotFoundError 
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;
    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);

    const credit = await this.creditRepository.findById(id);
    if (!credit) return new CreditNotFoundError();

    if (credit.isFullyPaid()) return new CreditAlreadyPaidError(credit.id);

    const updatedCredit = credit.payMonthly();
    if (updatedCredit instanceof Error) return updatedCredit;

    await this.creditRepository.update(credit);
    return credit;
  }
}
