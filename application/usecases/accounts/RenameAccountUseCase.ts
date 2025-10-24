import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class RenameAccountUsecase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService
  ) {}

  public async execute(account: AccountEntity) {
    // On ne reçoit pas un accountEntity mais des élements où et on créer une account entities
    // + création des vérifications et des errors
    await this.accountRepository.updateAccount(account.iban, account);
    // email à récupérer à ne pas mettre en dur

    await this.emailService.sendEmail({
      to: "administrator@avenir.com",
      subject: "Compte modifié",
      text: `Votre compte a été modifié avec un nouveau nom ${account.name}.`,
    });
  }
}
