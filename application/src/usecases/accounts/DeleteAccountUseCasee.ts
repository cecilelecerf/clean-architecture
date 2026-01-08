import {
  AccountHasActiveCreditError,
  AccountNotFoundError,
  MissingIBANError,
  UnauthorizedAccessAccountError,
} from "@application/errors/accounts";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { findActiveUser } from "@application/utils/userValidators";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";
import { IBAN } from "@domain/values/IBAN";
import {
  InvalidTransactionAmountError,
  InvalidTransactionLabelError,
  SameAccountError,
} from "@domain/errors/transaction";
import { MoneyConverter } from "@domain/services/MoneyConverter";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import { InsufficientFundsError } from "@domain/errors/account";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
type Props = {
  accountIban: string;
  transferTargetIban: string;
  requestUserId: string;
};
export class DeleteAccountUseCase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly moneyConvertor: MoneyConverter,
    private readonly clockService: ClockService,
    private readonly uuidService: UuidService,
    private readonly creditRepo: CreditRepository
  ) {}

  public async execute({
    accountIban,
    transferTargetIban,
    requestUserId,
  }: Props): Promise<
    | MissingIBANError
    | UnauthorizedAccessAccountError
    | AccountNotFoundError
    | UserNotFoundError
    | UserNotActiveError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | SameAccountError
    | InvalidTransactionLabelError
    | InsufficientFundsError
    | InvalidTransactionAmountError
    | AccountHasActiveCreditError
    | void
  > {
    if (!accountIban || accountIban.trim().length === 0) {
      return new MissingIBANError();
    }
    if (!requestUserId) return new AccountNotFoundError();

    const iban = IBAN.create(accountIban);
    if (iban instanceof Error) return iban;

    const accountToDelete = await this.accountRepository.findByIBAN(iban);
    if (!accountToDelete) return new AccountNotFoundError();

    const user = await findActiveUser(this.userRepository, requestUserId);
    if (user instanceof Error) return user;

    if (accountToDelete.userId !== requestUserId) {
      return new UnauthorizedAccessAccountError();
    }

    const credits = await this.creditRepo.findAllByAccountIban(
      accountToDelete.iban
    );
    if (credits.length) return new AccountHasActiveCreditError();
    console.log(accountToDelete);
    if (accountToDelete.balance.amount > 0) {
      if (!transferTargetIban || transferTargetIban.trim().length === 0) {
        return new MissingIBANError();
      }

      const targetIban = IBAN.create(transferTargetIban);
      if (targetIban instanceof Error) return targetIban;

      if (iban.value === targetIban.value) {
        return new SameAccountError(iban.value);
      }

      const targetAccount = await this.accountRepository.findByIBAN(targetIban);
      if (!targetAccount) return new AccountNotFoundError();

      if (targetAccount.userId !== requestUserId) {
        return new UnauthorizedAccessAccountError();
      }

      const moneyConverted = await this.moneyConvertor.convert(
        accountToDelete.balance,
        targetAccount.balance.currency
      );
      if (moneyConverted instanceof Error) return moneyConverted;

      const transaction = TransactionEntity.create({
        id: this.uuidService.generate(),
        fromAccountId: iban,
        toAccountId: targetIban,
        amount: moneyConverted,
        label: `Fermeture du compte ${accountToDelete.name}`,
        date: this.clockService.now(),
        icon: "",
      });

      if (transaction instanceof Error) return transaction;

      const debitResult = accountToDelete.debit(accountToDelete.balance);
      if (debitResult instanceof Error) return debitResult;

      targetAccount.credit(moneyConverted);
      console.log(moneyConverted);
      await this.transactionRepository.save(transaction);
      await this.accountRepository.update(accountToDelete);
      await this.accountRepository.update(targetAccount);

      await this.emailService.sendEmail({
        to: user.email,
        subject: "Transfert des fonds et fermeture de compte",
        text: `Votre compte ${
          iban.value
        } a été fermé. Un montant de ${moneyConverted.amount.toLocaleString(
          "fr-FR",
          { style: "currency", currency: moneyConverted.currency }
        )} a été transféré vers votre compte ${targetIban.value}.`,
      });
    } else {
      await this.emailService.sendEmail({
        to: user.email,
        subject: "Compte supprimé",
        text: `Votre compte ${iban.value} a été supprimé avec succès.`,
      });
    }

    await this.accountRepository.delete(iban);
  }
}
