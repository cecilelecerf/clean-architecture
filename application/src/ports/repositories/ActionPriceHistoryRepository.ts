import { ActionPriceHistoryEntity } from "@domain/entities/ActionPriceHistoryEntity";

export interface ActionPriceHistoryRepository {
  save(history: ActionPriceHistoryEntity): Promise<void>;
  findByISIN(
    isin: string,
    now: Date,
    days?: number
  ): Promise<ActionPriceHistoryEntity[]>;
  findByISINAndDateRange(
    isin: string,
    startDate: Date,
    endDate: Date
  ): Promise<ActionPriceHistoryEntity[]>;
  deleteByISIN(isin: string): Promise<void>;
  findLastByISIN(isin: string): Promise<ActionPriceHistoryEntity | null>;
}
