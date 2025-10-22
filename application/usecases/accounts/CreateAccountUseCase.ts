import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class CreateAccountUsecase{
    public constructor(
        private readonly accountRepository: AccountRepository,
        private readonly emailService: EmailService
    ){}

    public async execute(account: AccountEntity){
        await this.accountRepository.saveAccount(account);

        await this.emailService.sendEmail({
        to: "administrator@avenir.com",
        subject: "Compte créé",
        text: `Votre compte a été créé.`
        });
    }
}