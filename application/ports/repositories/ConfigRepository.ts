import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export interface ConfigRepository {
  getSavingsRate(): Promise<SavingsRateEntity[]>;
  findCurrentRate(): Promise<SavingsRateEntity|null>;
  updateSavingsRate(savingsRate: SavingsRateEntity): Promise<void>;
  saveSavingsRate(savingsRate: SavingsRateEntity): Promise<void>;
}