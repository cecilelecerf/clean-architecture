import { CurrencyEntity } from "@domain/entities/CurrencyEntity";

export interface CurrencyRepository {
  save(currency: CurrencyEntity): Promise<void>;
  update(currency: CurrencyEntity): Promise<void>;
  delete(code: string): Promise<void>;
  findByCode(code: string): Promise<CurrencyEntity | null>;
  findAll(): Promise<CurrencyEntity[]>;
}
