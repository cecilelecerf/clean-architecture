import { AccountNotFoundError,MissingIBANError,UnauthorizedAccessAccountError } from "@application/errors/accounts";
 import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { findActiveUser } from "@application/utils/userValidators";
import { IBANInvalidCheckDigitsError, IBANInvalidFormatError, IBANTooLongError, IBANTooShortError } from "@domain/errors/IBAN";
 import { IBAN } from "@domain/values/IBAN";

export class DeleteAccountUsecase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository
  ) {}

  public async execute(accountIban: string, requestUserId: string): Promise<
    | MissingIBANError
    | UnauthorizedAccessAccountError
    | AccountNotFoundError
    | UserNotFoundError
    | UserNotActiveError
    | IBANTooShortError 
    | IBANTooLongError 
    | IBANInvalidFormatError 
    | IBANInvalidCheckDigitsError
    | void> {
    if (!accountIban || accountIban.trim().length === 0) {
      return new MissingIBANError();
    }
    if (!requestUserId) return new AccountNotFoundError();

    const iban = IBAN.create(accountIban);
    if (iban instanceof Error) return iban;

    const existingAccount = await this.accountRepository.findByIBAN(iban);
    if (!existingAccount) return new AccountNotFoundError();

    const user = await findActiveUser(this.userRepository, requestUserId);
    if (user instanceof Error) return user;

    if (!existingAccount.owner.belongsTo(user.id)) {
      return new UnauthorizedAccessAccountError();
    }

    await this.accountRepository.delete(iban);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte supprimé",
      text: `Vous avez supprimé votre compte.`,
    });
  }
}
