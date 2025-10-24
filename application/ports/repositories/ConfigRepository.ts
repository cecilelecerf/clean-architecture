import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export interface ConfigRepository {
  findCurrent(): Promise<SavingsRateEntity | null>;
  findAll(): Promise<SavingsRateEntity[]>;
  update(savingsRate: SavingsRateEntity): Promise<void>;
  save(savingsRate: SavingsRateEntity): Promise<void>;
}
