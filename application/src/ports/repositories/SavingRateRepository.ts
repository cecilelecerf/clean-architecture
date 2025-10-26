import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export interface SavingRateRepository {
  findAll(): Promise<SavingsRateEntity[]>;
  findById(id: SavingsRateEntity["id"]): Promise<SavingsRateEntity | null>;
  update(savingsRate: SavingsRateEntity): Promise<void>;
  save(savingsRate: SavingsRateEntity): Promise<void>;
}
