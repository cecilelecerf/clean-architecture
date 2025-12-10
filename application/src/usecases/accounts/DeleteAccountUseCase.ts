import { AccountNotFoundError,MissingIBANError,UnauthorizedAccessAccountError } from "@application/errors/accounts";
 import { UserNotFoundError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EmailService } from "@application/ports/services/EmailService";
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
      // TODO Faire une vérification si l'user est bien un client et si il est bien actif (findActifUser())
    if (!accountIBAN) return new MissingIBANError();
    if (!requestUserId) return new AccountNotFoundError();

    const existingAccount = await this.accountRepository.findByIBAN(accountIBAN);
    if (!existingAccount) return new AccountNotFoundError();

    if (existingAccount.userId !== requestUserId) {
      return new UnauthorizedAccessAccountError();
    }
// TODO : pourquoi faire cette vérification ici ?
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
