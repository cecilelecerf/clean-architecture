import { AccountEntity } from "@domain/entities/AccountEntity";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { AccountEntityWithUser } from "./AccountRepository";
import { TransactionFilters } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";

export type TransactionEntityWithAccount = TransactionEntity & {
  fromAccount: AccountEntity;
  toAccount: AccountEntity;
};
export type TransactionEntityWithAccountWithUser = TransactionEntity & {
  fromAccount: AccountEntityWithUser;
  toAccount: AccountEntityWithUser;
};
export interface TransactionRepository {
  findByDateRange(startDate: Date, endDate: Date): Promise<TransactionEntity[]>;
  findByIban(iban: IBAN): Promise<TransactionEntity[]>;
  findById(id: TransactionEntity["id"]): Promise<TransactionEntity | null>;
  save(transaction: TransactionEntity): Promise<void>;
  delete(id: TransactionEntity["id"]): Promise<void>;
  findByIdWithAccountWithUser(
    id: TransactionEntity["id"]
  ): Promise<TransactionEntityWithAccountWithUser | null>;
  findAllByAccountWithFilters(
    iban: IBAN,
    filters?: TransactionFilters
  ): Promise<{ transactions: TransactionEntity[]; total: number }>;
}
