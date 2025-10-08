import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export interface ConfigRepository {
  getSavingsRate(): Promise<SavingsRateEntity[]>;
  updateSavingsRate(savingsRate: SavingsRateEntity): Promise<void>;
  saveSavingsRate(savingsRate: SavingsRateEntity): Promise<void>;
}