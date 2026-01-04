import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import {
  AccountNotFoundError,
  UnauthorizedAccessAccountError,
} from "@application/errors/accounts";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMismatchError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { findActiveUser } from "@application/utils/userValidators";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import {
  InvalidTransactionAmountError,
  InvalidTransactionLabelError,
} from "@domain/errors/transaction";

interface Props {
  requestUserId: string;
  fromAccountIban: string;
  toAccountIban: string;
  amountValue: number;
  amountCurrency: string;
  label: string;
  icon: string;
}
export class TransfertBetweenAccountUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly clockService: ClockService,
    private readonly uuidService: UuidService,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    requestUserId,
    fromAccountIban: fromIbanString,
    toAccountIban: toIbanString,
    amountValue,
    amountCurrency,
    label,
    icon,
  }: Props): Promise<
    | AccountNotFoundError
    | UnauthorizedAccessAccountError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | MoneyCurrencyMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | InvalidTransactionLabelError
    | InvalidTransactionAmountError
    | void
  > {
    const fromIbanResult = IBAN.create(fromIbanString);
    if (fromIbanResult instanceof Error) return fromIbanResult;
    const fromIBAN = fromIbanResult;

    const toIbanResult = IBAN.create(toIbanString);
    if (toIbanResult instanceof Error) return toIbanResult;
    const toIBAN = toIbanResult;

    const amount = Money.create({
      amount: amountValue,
      currency: amountCurrency,
    });
    if (amount instanceof Error) return amount;

    const fromAccount = await this.accountRepository.findByIBAN(fromIBAN);
    if (!fromAccount) return new AccountNotFoundError();

    const toAccount = await this.accountRepository.findByIBAN(toIBAN);
    if (!toAccount) return new AccountNotFoundError();

    const user = await findActiveUser(this.userRepository, requestUserId);
    if (user instanceof Error) return user;

    if (fromAccount.userId !== requestUserId) {
      return new UnauthorizedAccessAccountError();
    }

    const withdrawResult = fromAccount.debit(amount);
    if (withdrawResult instanceof Error) return withdrawResult;

    const depositResult = toAccount.credit(amount);
    if (depositResult instanceof Error) return depositResult;

    const now = this.clockService.now();

    const transaction = TransactionEntity.create({
      id: this.uuidService.generate(),
      fromAccountId: fromAccount.iban,
      toAccountId: toAccount.iban,
      amount,
      label,
      icon,
      date: now,
    });
    if (transaction instanceof Error) return transaction;
    await this.transactionRepository.save(transaction);

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
  }
}
