import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class RenameAccountUsecase{
    public constructor(
        private readonly accountRepository: AccountRepository,
        private readonly emailService: EmailService
    ){}

    public async execute(account: AccountEntity){
        await this.accountRepository.updateAccount(account.iban, account);

        await this.emailService.sendEmail({
        to: "administrator@avenir.com",
        subject: "Compte modifié",
        text: `Votre compte a été modifié avec un nouveau nom ${account.name}.`
        });
    }
}