import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { MoneyConverter } from "@domain/services/MoneyConverter";
import { ActionStatisticsService } from "@domain/services/ActionStatisticsService";
import { ActionDTO, ActionEntity } from "@domain/entities/ActionEntity";

type ActionSuggestion = ActionDTO & {
  priceChange7d?: number;
};

type Props = {
  limit?: number;
};

export class GetActionSuggestionsUseCase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly orderRepository: OrderRepository,
    private readonly clockService: ClockService,
    private readonly moneyConverter: MoneyConverter
  ) {}

  async execute({ limit = 5 }: Props): Promise<ActionSuggestion[] | Error> {
    const allActions = await this.actionRepository.findAllAvailable(true);
    if (allActions.length === 0) {
      return [];
    }

    const suggestionsWithStats = await Promise.all(
      allActions.map((action) => this.enrichWithStats(action))
    );

    const validSuggestions = suggestionsWithStats.filter(
      (stat) => !(stat instanceof Error)
    ) as Array<ActionDTO & { priceChange7d?: number; _volatility: number }>;

    const sorted = validSuggestions
      .sort((a, b) => b._volatility - a._volatility)
      .slice(0, limit);

    return sorted;
  }

  private async enrichWithStats(
    action: ActionEntity
  ): Promise<
    (ActionDTO & { priceChange7d?: number; _volatility: number }) | Error
  > {
    try {
      const now = this.clockService.now();
      const startDate = this.clockService.addDays(now, -7);

      const orders =
        await this.orderRepository.findAllExecutedByISINAndDateRange(
          action.ISIN,
          startDate,
          now
        );

      if (orders.length === 0) {
        return Object.assign(action.toDTO(), {
          priceChange7d: undefined,
          _volatility: 0,
        });
      }

      const oldestPrice = ActionStatisticsService.getOldestPrice(orders);
      if (!oldestPrice) {
        return Object.assign(action.toDTO(), {
          priceChange7d: undefined,
          _volatility: 0,
        });
      }

      const convertedPrice = await this.moneyConverter.convert(
        oldestPrice,
        action.price.currency
      );
      if (convertedPrice instanceof Error) return convertedPrice;

      const priceChange = ActionStatisticsService.calculatePriceChangePercent(
        action.price,
        convertedPrice
      );

      if (priceChange instanceof Error) return priceChange;

      const volatility = ActionStatisticsService.calculateVolatility(orders);

      return Object.assign(action.toDTO(), {
        priceChange7d: priceChange,
        _volatility: volatility,
      });
    } catch (error) {
      console.error(`Error enriching action ${action.ISIN}:`, error);
      return Object.assign(action.toDTO(), {
        priceChange7d: undefined,
        _volatility: 0,
      });
    }
  }
}
