import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export interface ConfigRepository {
  findAll(): Promise<SavingsRateEntity[]>;
  update(savingsRate: SavingsRateEntity): Promise<void>;
  save(savingsRate: SavingsRateEntity): Promise<void>;
}
