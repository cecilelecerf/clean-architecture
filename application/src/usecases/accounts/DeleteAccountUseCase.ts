import { AccountNotFoundError } from "@application/errors/accounts/AccountNotFound";
import { MissingIBANError } from "@application/errors/accounts/MissingIBANError";
import { UnauthorizedAccessAccountError } from "@application/errors/accounts/UnauthorizedAccessAccountError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";
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
    | void> {
    if (!accountIBAN) return new MissingIBANError();

    if (!requestUserId) return new AccountNotFoundError();

    const existingAccount = await this.accountRepository.findByIBAN(accountIBAN);
    if (!existingAccount) return new AccountNotFoundError();

    if (existingAccount.userId !== requestUserId) {
      return new UnauthorizedAccessAccountError();
    }

    const user = await this.userRepository.findById(existingAccount.userId);
    if (!user) return new UserNotFoundError();

    await this.accountRepository.delete(accountIBAN);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte supprimé",
      text: `Vous avez supprimé votre compte.`,
    });
  }
}
