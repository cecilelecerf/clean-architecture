import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";

export interface TransactionRepository {
  findByDateRange(startDate: Date, endDate: Date): Promise<TransactionEntity[]>;
  findByIban(iban: IBAN): Promise<TransactionEntity[]>;
  save(transaction: TransactionEntity): Promise<void>;
  delete(iban: IBAN, transaction: TransactionEntity): Promise<void>;
}
