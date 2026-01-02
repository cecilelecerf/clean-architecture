import { AccountNotFoundError } from "@application/errors/accounts";
import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { CreditDTO } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  accountId: AccountEntity["iban"];
  userId: UserEntity["id"];
};

export class GetCreditByAccountUseCase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  public async execute({
    accountId,
    userId
  }: Props): Promise <
    | CreditDTO[]
    | UserNotFoundError 
    | UserNotActiveError
    | AccountNotFoundError
  >{
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const account = await this.accountRepository.findByIBAN(accountId);
    if (!account) return new AccountNotFoundError();

    const credits = await this.creditRepository.findAllByAccountIban(account.iban);

    return credits.map((credit) => credit.toDTO());
  }
}