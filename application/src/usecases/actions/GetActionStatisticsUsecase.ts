import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionNotFoundError } from "@application/errors/actions";
import { ClockService } from "@application/ports/services/ClockService";

type ActionStatsDTO = {
  priceChange: number;
  change24h: number;
  change7d: number;
  change30d: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  totalVolume: number;
  transactionCount: number;
};

type Props = {
  isin: string;
};

export class GetActionStatisticsUsecase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly clockService: ClockService
  ) {}

  async execute({
    isin,
  }: Props): Promise<ActionStatsDTO | ActionNotFoundError> {
    const action = await this.actionRepository.findByISIN(isin);
    if (!action) return new ActionNotFoundError();

    const stats = await this.actionRepository.getStatistics(
      isin,
      this.clockService.now()
    );
    return {
      priceChange: stats.priceChange,
      change24h: stats.change24h,
      change7d: stats.change7d,
      change30d: stats.change30d,
      minPrice: stats.minPrice,
      maxPrice: stats.maxPrice,
      averagePrice: stats.averagePrice,
      totalVolume: stats.totalVolume,
      transactionCount: stats.transactionCount,
    };
  }
}
