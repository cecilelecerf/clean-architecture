import { AccountNotFoundError } from "@application/errors/accounts";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountDTO, AccountEntity } from "@domain/entities/AccountEntity";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";
import { IBAN } from "@domain/values/IBAN";

type Props = { iban: string; userId: string };

export class GetAccountByIBANUseCase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    iban,
    userId,
  }: Props): Promise<
    | AccountDTO
    | UserNotFoundError
    | UserNotActiveError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
    | AccountNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const ibanVO = IBAN.create(iban);
    if (ibanVO instanceof Error) return ibanVO;

    const account = await this.accountRepository.findByIBAN(ibanVO);
    console.log(account);
    if (!account) return new AccountNotFoundError();

    return account.toDTO();
  }
}
