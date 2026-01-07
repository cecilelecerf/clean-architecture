import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
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

export type TransactionFilters = {
  label?: string;
  type?: "debit" | "credit";
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
};

interface Props {
  iban: string;
  clientId: string;
  requesterId?: string;
  filters?: TransactionFilters;
}

export class GetAllTransactionsByAccountUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    iban,
    clientId,
    requesterId,
    filters,
  }: Props): Promise<
    | {
        transactions: TransactionDTO[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
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
    console.log("test");
    const ibanVO = IBAN.create(iban);
    if (ibanVO instanceof Error) return ibanVO;

    if (client.hasRole({ role: "client" })) {
      const account = await this.accountRepository.findByIBAN(ibanVO);
      console.log(account);

      if (!account?.isClientAccount(client)) {
        return new InvalidAccountOwnerError();
      }
    }
    console.log(requesterId);
    if (requesterId) {
      const admin = await findActiveUser(this.userRepository, requesterId);
      if (admin instanceof Error) return admin;
      if (admin.hasRole({ role: "client" })) {
        return new UserRoleMismatchError(
          ["conseiller", "directeur"],
          admin.role
        );
      }
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const result = await this.transactionRepository.findAllByAccountWithFilters(
      ibanVO,
      {
        ...filters,
        page,
        limit,
      }
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      transactions: result.transactions.map((transaction) =>
        transaction.toDTO(ibanVO)
      ),
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }
}
