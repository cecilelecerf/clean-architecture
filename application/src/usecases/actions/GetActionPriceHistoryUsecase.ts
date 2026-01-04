import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionPriceHistoryRepository } from "@application/ports/repositories/ActionPriceHistoryRepository";
import { ActionNotFoundError } from "@application/errors/actions";
import { ClockService } from "@application/ports/services/ClockService";

type ActionPriceHistoryDTO = {
  id: string;
  date: string;
  price: number;
  volume: number;
};

type Props = {
  isin: string;
  days?: number;
};

export class GetActionPriceHistoryUsecase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly actionPriceHistoryRepository: ActionPriceHistoryRepository,
    private readonly clockService: ClockService
  ) {}

  async execute({
    isin,
    days = 30,
  }: Props): Promise<ActionPriceHistoryDTO[] | ActionNotFoundError> {
    const action = await this.actionRepository.findByISIN(isin);
    if (!action) return new ActionNotFoundError();

    const now = this.clockService.now();

    const history = await this.actionPriceHistoryRepository.findByISIN(
      isin,
      now,
      days
    );

    if (history.length > 0) {
      return history.map((item) => item.toDTO());
    }

    const lastKnown = await this.actionPriceHistoryRepository.findLastByISIN(
      isin
    );

    if (!lastKnown) {
      return [];
    }

    return [lastKnown.toDTO()];
  }
}
