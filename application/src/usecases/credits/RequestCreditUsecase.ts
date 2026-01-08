import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import {
  CreditDTO,
  CreditEntity,
  CreditStatus,
} from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { Money } from "@domain/values/Money";
import { InvalidPercentageError } from "@domain/errors/percentage";
import { InvalidCreditDurationError } from "@domain/errors/credit";
import { AccountNotFoundError } from "@application/errors/accounts";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import { IBAN } from "@domain/values/IBAN";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";

type Props = {
  clientId: UserEntity["id"];
  accountId: string;
  formuleCreditId: FormuleCreditEntity["id"];
  amount: number;
  currency: string;
  startDate: string;
} & Pick<CreditEntity, "durationMonths">;

export class RequestCreditUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly formuleRepository: FormuleCreditRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    clientId,
    accountId,
    formuleCreditId,
    amount,
    currency,
    durationMonths,
    startDate: startDateStr,
  }: Props): Promise<
    | CreditDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | InvalidPercentageError
    | InvalidCreditDurationError
    | AccountNotFoundError
    | FormuleCreditNotFoundError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;
    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);

    const iban = IBAN.create(accountId);
    if (iban instanceof Error) return iban;

    const existingAccount = await this.accountRepository.findByIBAN(iban);
    if (!existingAccount) return new AccountNotFoundError();

    const formuleCredit = await this.formuleRepository.findById(
      formuleCreditId
    );
    if (!formuleCredit) return new FormuleCreditNotFoundError();

    const initialAmountVO = Money.create({ amount: amount, currency });
    if (initialAmountVO instanceof Error) return initialAmountVO;
    const startDate = this.clockService.toDate(startDateStr);
    const credit = CreditEntity.create(
      {
        id: this.uuidService.generate(),
        advisorId: null,
        accountId: iban,
        formuleCreditId: formuleCredit.id,
        initialAmount: initialAmountVO,
        durationMonths,
        startDate,
        status: CreditStatus.PENDING,
        createdAt: this.clockService.now(),
        reason: null,
      },
      formuleCredit.interestRate,
      formuleCredit.insuranceRate
    );

    if (credit instanceof Error) return credit;

    await this.creditRepository.save(credit);

    return credit.toDTO();
  }
}
