import { MissingOrInvalidNameError } from "@application/errors/accounts";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { InvalidAccountNameError } from "@domain/errors/account";
import { Color } from "@domain/values/Color";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";

interface Props {
  userId: string;
  name: string;
  type: "courant" | "epargne";
  color: string;
  currency: string;
}

export class CreateAccountUseCase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    userId,
    name,
    type,
    color,
    currency,
  }: Props): Promise<
    | UserNotFoundError
    | UserNotActiveError
    | MissingOrInvalidNameError
    | InvalidAccountNameError
    | AccountEntity
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const ibanVO = IBAN.generate("FR", "20041010050500013M02606");

    const colorVO = Color.create(color);
    if (colorVO instanceof Error) return colorVO;

    const balanceVO = Money.create({
      amount: 0,
      currency,
    });
    if (balanceVO instanceof Error) return balanceVO;

    const today = this.clockService.now();

    var requestUser = null;
    if (user.hasRole({ role: "client" }) && user.id === userId) {
      requestUser = userId;
    }

    const account = AccountEntity.create({
      iban: ibanVO,
      userId: requestUser,
      name,
      type,
      color: colorVO,
      balance: balanceVO,
      createdAt: today,
    });

    if (account instanceof Error) return account;

    await this.accountRepository.save(account);

    await this.emailService.sendEmail({
      to: user.email,
      subject: "Compte créé",
      text: `Votre compte a été créé.`,
    });
    return account;
  }
}
