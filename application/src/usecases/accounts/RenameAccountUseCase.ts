import { AccountNotFoundError,MissingIBANError,MissingOrInvalidNameError } from "@application/errors/accounts";
import { UserNotFoundError } from "@application/errors/users";
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
// TODO : tout le monde peut modifier le nom de l'account ?
// ? Je pense que tu peux créer une method dans AccountEntity ou tu passes un User et ça te fait la vérification du role si il est actif et si c'est bien son rôle
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

    // TODO : je pense qu'il faut faire cela dans une method de AccountEntity et en profiter pour faire la vérification du name dedans
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
