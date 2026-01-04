import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionPriceHistoryRepository } from "@application/ports/repositories/ActionPriceHistoryRepository";
import { ClockService } from "@application/ports/services/ClockService";

type ActionSuggestion = {
  ISIN: string;
  symbol: string;
  name: string;
  currentPrice: {
    amount: number;
    currency: string;
  };
  market: string;
  activitySector: string;
  priceChange?: number;
  isAvailable: boolean;
};

type Props = {
  limit?: number;
};

export class GetActionSuggestionsUseCase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly actionPriceHistoryRepository: ActionPriceHistoryRepository,
    private readonly clockService: ClockService
  ) {}

  async execute({ limit = 5 }: Props): Promise<ActionSuggestion[]> {
    const allActions = await this.actionRepository.findAll();

    const availableActions = allActions.filter((action) => action.isAvailable);

    if (availableActions.length === 0) {
      return [];
    }

    const suggestionsWithStats = await Promise.all(
      availableActions.map(async (action) => {
        try {
          const history = await this.actionPriceHistoryRepository.findByISIN(
            action.ISIN,
            this.clockService.now(),
            7
          );

          let priceChange: number | undefined = undefined;

          if (history.length >= 2) {
            const oldestPrice = history[0].price;
            const currentPrice = action.currentPrice.amount;

            if (oldestPrice > 0) {
              priceChange = ((currentPrice - oldestPrice) / oldestPrice) * 100;
              priceChange = Math.round(priceChange * 100) / 100;
            }
          }

          return {
            ...action,
            _priceChangeAbs: priceChange ? Math.abs(priceChange) : 0,
          };
        } catch (error) {
          return {
            ISIN: action.ISIN,
            symbol: action.symbol,
            name: action.name,
            currentPrice: {
              amount: action.currentPrice.amount,
              currency: action.currentPrice.currency,
            },
            market: action.market,
            activitySector: action.activitySector,
            priceChange: undefined,
            isAvailable: action.isAvailable,
            _priceChangeAbs: 0,
          };
        }
      })
    );

    const sorted = suggestionsWithStats
      .sort((a, b) => b._priceChangeAbs - a._priceChangeAbs)
      .slice(0, limit);

    return sorted.map(({ _priceChangeAbs, ...suggestion }) => suggestion);
  }
}
