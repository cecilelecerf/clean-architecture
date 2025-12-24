import {
  TransactionDTOMapper,
  TransactionEntityWithAccountDTO,
} from "@application/dto/TransactionDTOMapper";
import {
  TransactionNotFoundError,
  UnauthorizedTransactionAccessError,
} from "@application/errors/transactions";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { InvalidAccountOwnerError } from "@domain/errors/account";
import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";

interface Props {
  transactionId: string;
  userId: string;
}

export class GetTransactionByIdUseCase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  public async execute({
    transactionId,
    userId,
  }: Props): Promise<
    | TransactionEntityWithAccountDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | UnauthorizedTransactionAccessError
    | TransactionNotFoundError
  > {
    const client = await findActiveUser(this.userRepository, userId);
    if (client instanceof Error) return client;

    const transaction =
      await this.transactionRepository.findByIdWithAccountWithUser(
        transactionId
      );
    if (!transaction) return new TransactionNotFoundError(transactionId);

    if (client.hasRole({ role: "client" })) {
      if (
        !transaction.fromAccount?.isClientAccount(client) &&
        !transaction.toAccount?.isClientAccount(client)
      )
        return new UnauthorizedTransactionAccessError(
          client.id,
          transaction.id
        );
    }

    return TransactionDTOMapper.withUserMap(transaction);
  }
}
