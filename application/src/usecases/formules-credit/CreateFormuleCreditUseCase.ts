import { AccountNotFoundError } from "@application/errors/accounts";
import {
  FormuleCreditAlreadyExistsError,
  NegativeInterestRateError,
} from "@application/errors/formules-credit";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import {
  FormuleCreditDTO,
  FormuleCreditEntity,
} from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { InvalidFormuleTypeError } from "@domain/errors/formuleType";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { InvalidPercentageError } from "@domain/errors/percentage";
import { FormuleType } from "@domain/values/FormuleType";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

type Props = {
  userId: UserEntity["id"];
  interestRate: number;
  insuranceRate: number;
  label: string;
  type: string;
  description: string;
  accountId: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
};
export class CreateFormuleCreditUseCase {
  constructor(
    private readonly formuleRepository: FormuleCreditRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    userId,
    interestRate,
    insuranceRate,
    label,
    type: typeStr,
    description,
    accountId,
    minAmount,
    maxAmount,
    currency,
  }: Props): Promise<
    | FormuleCreditDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | FormuleCreditAlreadyExistsError
    | NegativeInterestRateError
    | InvalidPercentageError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | AccountNotFoundError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
    | InvalidFormuleTypeError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], user.role);

    const exists = await this.formuleRepository.existsByLabel(label);
    if (exists) return new FormuleCreditAlreadyExistsError(label);

    if (interestRate < 0) return new NegativeInterestRateError();

    const interestRateVO = Percentage.create(interestRate);
    if (interestRateVO instanceof Error) return interestRateVO;

    const insuranceRateVO = Percentage.create(insuranceRate);
    if (insuranceRateVO instanceof Error) return insuranceRateVO;

    const iban = IBAN.create(accountId);
    if (iban instanceof Error) return iban;
    const account = await this.accountRepository.findByIBAN(iban);
    if (!account) return new AccountNotFoundError();

    let minAmountVO: Money | undefined;
    let maxAmountVO: Money | undefined;

    if (minAmount !== undefined && currency) {
      const tmp = Money.create({ amount: minAmount, currency });
      if (tmp instanceof Error) return tmp;
      minAmountVO = tmp;
    }

    if (maxAmount !== undefined && currency) {
      const tmp = Money.create({ amount: maxAmount, currency });
      if (tmp instanceof Error) return tmp;
      maxAmountVO = tmp;
    }

    const type = FormuleType.create(typeStr);
    if (type instanceof Error) return type;
    const formuleCredit = FormuleCreditEntity.create({
      id: this.uuidService.generate(),
      interestRate: interestRateVO,
      insuranceRate: insuranceRateVO,
      type,
      label,
      description,
      accountId: account.iban,
      createdAt: this.clockService.now(),
      minAmount: minAmountVO,
      maxAmount: maxAmountVO,
      currency: currency,
    });

    await this.formuleRepository.save(formuleCredit);

    return formuleCredit.toDTO();
  }
}
