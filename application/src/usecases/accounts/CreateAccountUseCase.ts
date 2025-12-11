import { MissingOrInvalidNameError } from "@application/errors/accounts";
import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { InvalidAccountNameError } from "@domain/errors/account";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
// TODO tu dois pas récupérer un type IBAN | color | Money directement mais des types string par exemple et tu dois les mettre au format IBAN et autre dans le use case
interface Props {
  iban: IBAN;
  userId: string;
  name: string;
  type: "courant" | "epargne";
  color: AccountEntity["color"];
  balance: Money;
}

export class CreateAccountUsecase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    iban,
    userId,
    name,
    type,
    color,
    balance
  }: Props): Promise<
  | UserNotFoundError
  | UserNotActiveError
  | MissingOrInvalidNameError
  | InvalidAccountNameError
  | void> {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const today = this.clockService.now();
    const account = AccountEntity.create({
      iban,
      userId,
      name,
      type,
      color,
      balance,
      createdAt: today,
      updatedAt: today,
    })
    if (account instanceof Error) return account;
    await this.accountRepository.save(account);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte créé",
      text: `Votre compte a été créé.`,
    });
  }
}
