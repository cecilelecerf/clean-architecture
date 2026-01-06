import { ActionEntity } from "@domain/entities/ActionEntity";

export interface ActionStatistics {
  priceChange: number;
  change24h: number;
  change7d: number;
  change30d: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  totalVolume: number;
  transactionCount: number;
}
export interface ActionRepository {
  findByISIN(isin: ActionEntity["ISIN"]): Promise<ActionEntity | null>;
  findAll(): Promise<ActionEntity[]>;
  findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]>;
  setAvailability(action: ActionEntity): Promise<void>;
  save(action: ActionEntity): Promise<void>;
  update(action: ActionEntity): Promise<void>;
  delete(isin: ActionEntity["ISIN"]): Promise<void>;
  getStatistics(
    isin: ActionEntity["ISIN"],
    now: Date
  ): Promise<ActionStatistics>;
}
