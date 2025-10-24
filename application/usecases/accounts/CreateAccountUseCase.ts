import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class CreateAccountUsecase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService
  ) {}

  public async execute(account: AccountEntity) {
    // On ne reçoit pas un accountEntity mais des élements où et on créer une account entities
    // + création des vérifications et des errors
    await this.accountRepository.saveAccount(account);

    // email à récupérer à ne pas mettre en dur
    await this.emailService.sendEmail({
      to: "administrator@avenir.com",
      subject: "Compte créé",
      text: `Votre compte a été créé.`,
    });
  }
}
