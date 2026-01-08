import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { ActionNotFoundError } from "@application/errors/actions";
import { ClockService } from "@application/ports/services/ClockService";
import { MoneyConverter } from "@domain/services/MoneyConverter";
import { ActionStatisticsService } from "@domain/services/ActionStatisticsService";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { ISIN } from "@domain/values/ISIN";
import { InvalidISINError } from "@domain/errors/ISIN";

type ActionStatsDTO = {
  currentPrice: {
    amount: number;
    currency: string;
  };
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  minPrice7d: number;
  maxPrice7d: number;
  averagePrice7d: number;
  totalVolume7d: number;
  transactionCount7d: number;
  volatility31d: number;
};

type Props = {
  isin: string;
};

export class GetActionStatisticsUseCase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly orderRepository: OrderRepository,
    private readonly clockService: ClockService,
    private readonly moneyConverter: MoneyConverter
  ) {}

  async execute({
    isin,
  }: Props): Promise<ActionStatsDTO | ActionNotFoundError | InvalidISINError> {
    const validateIsin = ISIN.isValid(isin);
    if (validateIsin instanceof Error) return validateIsin;
    const action = await this.actionRepository.findByISIN(validateIsin);
    if (!action) return new ActionNotFoundError();

    const now = this.clockService.now();

    const [orders24h, orders7d, orders30d] = await Promise.all([
      this.orderRepository.findAllExecutedByISINAndDateRange(
        validateIsin,
        this.clockService.addDays(now, -1),
        now
      ),
      this.orderRepository.findAllExecutedByISINAndDateRange(
        validateIsin,
        this.clockService.addDays(now, -7),
        now
      ),
      this.orderRepository.findAllExecutedByISINAndDateRange(
        validateIsin,
        this.clockService.addDays(now, -30),
        now
      ),
    ]);
    const stats24h = ActionStatisticsService.calculateOrderStatistics(
      orders7d,
      action
    );
    const volatility31d =
      ActionStatisticsService.calculateVolatility(orders30d);

    const priceChange24h = await this.calculatePriceChange(action, orders24h);
    const priceChange7d = await this.calculatePriceChange(action, orders7d);
    const priceChange30d = await this.calculatePriceChange(action, orders30d);

    return {
      currentPrice: {
        amount: action.price.amount,
        currency: action.price.currency,
      },
      priceChange24h: priceChange24h instanceof Error ? 0 : priceChange24h,
      priceChange7d: priceChange7d instanceof Error ? 0 : priceChange7d,
      priceChange30d: priceChange30d instanceof Error ? 0 : priceChange30d,
      minPrice7d: stats24h.minPrice,
      maxPrice7d: stats24h.maxPrice,
      averagePrice7d: stats24h.averagePrice,
      totalVolume7d: stats24h.totalVolume,
      transactionCount7d: stats24h.transactionCount,
      volatility31d,
    };
  }

  private async calculatePriceChange(
    action: ActionEntity,
    orders: any[]
  ): Promise<number | Error> {
    const oldestPrice = ActionStatisticsService.getOldestPrice(orders);
    if (!oldestPrice) return 0;

    const convertedPrice = await this.moneyConverter.convert(
      oldestPrice,
      action.price.currency
    );
    if (convertedPrice instanceof Error) return convertedPrice;

    return ActionStatisticsService.calculatePriceChangePercent(
      action.price,
      convertedPrice
    );
  }
}
