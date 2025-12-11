import { AccountNotFoundError,MissingIBANError,UnauthorizedAccessAccountError } from "@application/errors/accounts";
 import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { findActiveUser } from "@application/utils/userValidators";
 import { IBAN } from "@domain/values/IBAN";

export class DeleteAccountUsecase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository
  ) {}

  public async execute(accountIBAN: IBAN, requestUserId: string): Promise<
    | MissingIBANError
    | UnauthorizedAccessAccountError
    | AccountNotFoundError
    | UserNotFoundError
    | UserNotActiveError
    | void> {
    if (!accountIBAN) return new MissingIBANError();
    if (!requestUserId) return new AccountNotFoundError();

    const existingAccount = await this.accountRepository.findByIBAN(accountIBAN);
    if (!existingAccount) return new AccountNotFoundError();

    const user = await findActiveUser(this.userRepository, requestUserId);
    if (user instanceof Error) return user;

    if (existingAccount.userId !== requestUserId) {
      return new UnauthorizedAccessAccountError();
    }

    await this.accountRepository.delete(accountIBAN);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte supprimé",
      text: `Vous avez supprimé votre compte.`,
    });
  }
}
