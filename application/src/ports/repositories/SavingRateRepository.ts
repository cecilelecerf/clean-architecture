import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export interface SavingRateRepository {
  findRateAtDate(date: Date): Promise<SavingsRateEntity | null>;
  findAll(): Promise<SavingsRateEntity[]>;
  save(savingsRate: SavingsRateEntity): Promise<void>;
}
