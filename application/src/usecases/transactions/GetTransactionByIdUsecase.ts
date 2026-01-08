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
import { IBAN } from "@domain/values/IBAN";

interface Props {
  transactionId: string;
  userId: string;
  requestUserId?: string;
}

export class GetTransactionByIdUseCase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  public async execute({
    transactionId,
    userId,
    requestUserId,
  }: Props): Promise<
    | TransactionEntityWithAccountDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | UnauthorizedTransactionAccessError
    | TransactionNotFoundError
  > {
    if (requestUserId) {
      const admin = await findActiveUser(this.userRepository, requestUserId);
      if (admin instanceof Error) return admin;
      if (admin.hasRole({ role: "client" }))
        return new UserRoleMismatchError(
          ["conseiller", "directeur"],
          admin.role
        );
    }
    const client = await findActiveUser(this.userRepository, userId);
    if (client instanceof Error) return client;

    const transaction =
      await this.transactionRepository.findByIdWithAccountWithUser(
        transactionId
      );
    if (!transaction) return new TransactionNotFoundError(transactionId);
    let contextIban: IBAN | undefined;

    const isFromAccount = transaction.fromAccount?.isClientAccount(client);
    const isToAccount = transaction.toAccount?.isClientAccount(client);

    if (!isFromAccount && !isToAccount && client.hasRole({ role: "client" })) {
      return new UnauthorizedTransactionAccessError(client.id, transaction.id);
    }

    if (isFromAccount) {
      contextIban = transaction.fromAccountId;
    } else if (isToAccount) {
      contextIban = transaction.toAccountId;
    }

    return TransactionDTOMapper.withUserMap(transaction);
  }
}
