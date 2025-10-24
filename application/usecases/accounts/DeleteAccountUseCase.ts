import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class DeleteAccountUsecase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService
  ) {}

  public async execute(account: AccountEntity) {
    // TODO: vérification que la personne à quie appartient l'account qui fait bien la requête
    await this.accountRepository.deleteAccount(account.iban, account);
    // email à récupérer à ne pas mettre en dur

    await this.emailService.sendEmail({
      to: "administrator@avenir.com",
      subject: "Compte supprimé",
      text: `Vous avez supprimé votre compte.`,
    });
  }
}
