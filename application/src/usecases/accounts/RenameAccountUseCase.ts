import { AccountNotFoundError,MissingIBANError,MissingOrInvalidNameError, UnauthorizedAccessAccountError } from "@application/errors/accounts";
import { InvalidAccountAccessError } from "@application/errors/accounts/InvalidAccountAccessError";
import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { InvalidAccountNameError } from "@domain/errors/account";
import { IBAN } from "@domain/values/IBAN";

export class RenameAccountUsecase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService,
    private readonly clockService: ClockService,
    private readonly userRepository: UserRepository
  ) {}
  public async execute(iban: string, requestUserId: string, newName: string): Promise<
  | MissingIBANError
  | MissingOrInvalidNameError
  | AccountNotFoundError
  | UserNotFoundError
  | InvalidAccountNameError
  | UserNotFoundError 
  | UserNotActiveError
  | InvalidAccountAccessError
  | UnauthorizedAccessAccountError
  | void> {
    if (!iban || iban.trim().length === 0) {
      return new MissingIBANError();
    }

    if (!newName || newName.trim().length === 0) {
      return new MissingOrInvalidNameError();
    }

    const user = await findActiveUser(this.userRepository, requestUserId);
    if (user instanceof Error) return user;

    const ibanVO = IBAN.create(iban);
    if (ibanVO instanceof Error) return ibanVO;

    const account = await this.accountRepository.findByIBAN(ibanVO);
    if (!account) return new AccountNotFoundError();

    if (account.userId !== requestUserId) {
      return new UnauthorizedAccessAccountError();
    }

    const now = this.clockService.now();
    const renameResult = account.rename(newName, user, now);
    if (renameResult instanceof Error) return renameResult;

    await this.accountRepository.update(account);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte modifié",
      text: `Le nom de votre compte a été modifié en "${account.name}".`,
    });
  }
}
