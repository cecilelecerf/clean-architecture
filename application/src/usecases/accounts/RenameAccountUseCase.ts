import { AccountNotFoundError } from "@application/errors/accounts/AccountNotFound";
import { MissingIBANError } from "@application/errors/accounts/MissingIBANError";
import { MissingOrInvalidNameError } from "@application/errors/accounts/MissingOrInvalidNameError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";
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
  | void> {
    if (!iban) return new MissingIBANError();

    if (!newName || newName.trim().length === 0) {
      return new MissingOrInvalidNameError();
    }

    const existingAccount = await this.accountRepository.findByIBAN(iban);

    if (!existingAccount) return new AccountNotFoundError();

    const today = this.clockService.now();

    const updatedAccount = AccountEntity.from({
      iban: existingAccount.iban,
      userId: existingAccount.userId,
      name: newName,
      type: existingAccount.type,
      color: existingAccount.color,
      balance: existingAccount.balance,
      createdAt: existingAccount.createdAt,
      updatedAt: today,
    });

    await this.accountRepository.update(updatedAccount);

    const user = await this.userRepository.findById(existingAccount.userId);

    if (!user) return new UserNotFoundError();

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte modifié",
      text: `Votre compte a été modifié avec un nouveau nom ${updatedAccount.name}.`,
    });
  }
}
