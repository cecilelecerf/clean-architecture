import { TransactionEntity } from "@domain/entities/TransactionEntity";

export interface TransactionRepository {
  findByDateRange(startDate: Date, endDate: Date): Promise<TransactionEntity[]>;
  findByAccountId(accountId: string): Promise<TransactionEntity[]>;
  saveTransaction(transaction: TransactionEntity): Promise<void>;
  deleteTransactionByAccountId(accountId: string, transaction: TransactionEntity): Promise<void>;
}