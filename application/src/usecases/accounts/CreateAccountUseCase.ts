import { MissingOrInvalidNameError } from "@application/errors/accounts/MissingOrInvalidNameError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";

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
      | MissingOrInvalidNameError
      | void> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) return new UserNotFoundError();

    if (!name || !name.trim()) {
      return new MissingOrInvalidNameError();
    }

    const today = this.clockService.now();

    const account = AccountEntity.from({
      iban,
      userId,
      name,
      type,
      color,
      balance,
      createdAt: today,
      updatedAt: today,
    });

    await this.accountRepository.save(account);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte créé",
      text: `Votre compte a été créé.`,
    });
  }
}
