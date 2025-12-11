import { AccountNotFoundError,MissingIBANError,MissingOrInvalidNameError } from "@application/errors/accounts";
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
  public async execute(iban: IBAN, newName: string): Promise<
  | MissingIBANError
  | MissingOrInvalidNameError
  | AccountNotFoundError
  | UserNotFoundError
  | InvalidAccountNameError
  | UserNotFoundError 
  | UserNotActiveError
  | InvalidAccountAccessError
  | void> {
    if (!iban) return new MissingIBANError();

    const existingAccount = await this.accountRepository.findByIBAN(iban);
    if (!existingAccount) return new AccountNotFoundError();

    const user = await findActiveUser(this.userRepository, existingAccount.userId);
    if (user instanceof Error) return user;

    const today = this.clockService.now();

    const updatedAccount = AccountEntity.create({
      iban: existingAccount.iban,
      userId: existingAccount.userId,
      name: newName,
      type: existingAccount.type,
      color: existingAccount.color,
      balance: existingAccount.balance,
      createdAt: existingAccount.createdAt, 
      updatedAt: today
    })
    if (updatedAccount instanceof Error) return updatedAccount;

    const access = updatedAccount.permissionToModify(user);
    if (!access) return new InvalidAccountAccessError(user.id, updatedAccount.iban);

    await this.accountRepository.update(updatedAccount);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte modifié",
      text: `Votre compte a été modifié avec un nouveau nom ${updatedAccount.name}.`,
    });
  }
}
