import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { TransactionDTO } from "@domain/entities/TransactionEntity";
import { InvalidAccountOwnerError } from "@domain/errors/account";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";
import { IBAN } from "@domain/values/IBAN";

interface Props {
  iban: string;
  clientId: string;
  requesterId?: string;
}

export class GetAllTransactionsByAccountUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  public async execute({
    iban,
    clientId,
    requesterId,
  }: Props): Promise<
    | TransactionDTO[]
    | UserNotFoundError
    | UserNotActiveError
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError
    | UserRoleMismatchError
    | InvalidAccountOwnerError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;

    const ibanVO = IBAN.create(iban);
    if (ibanVO instanceof Error) return ibanVO;

    if (client.hasRole({ role: "client" })) {
      const account = await this.accountRepository.findByIBAN(ibanVO);
      console.log(account);
      console.log(account?.isClientAccount(client));
      if (!account?.isClientAccount(client))
        return new InvalidAccountOwnerError();
    }

    if (requesterId) {
      const admin = await findActiveUser(this.userRepository, requesterId);
      if (admin instanceof Error) return admin;
      if (admin.hasRole({ role: "client" }))
        return new UserRoleMismatchError(
          ["conseiller", "directeur"],
          admin.role
        );
    }

    const transactions = await this.transactionRepository.findByIban(ibanVO);
    return transactions.map((transaction) => transaction.toDTO());
  }
}
