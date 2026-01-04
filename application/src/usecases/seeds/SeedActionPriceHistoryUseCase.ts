import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionPriceHistoryRepository } from "@application/ports/repositories/ActionPriceHistoryRepository";
import { ActionPriceHistoryEntity } from "@domain/entities/ActionPriceHistoryEntity";
import { ActionNotFoundError } from "@application/errors/actions";
import { UuidService } from "@application/ports/services/UuidService";
import { ClockService } from "@application/ports/services/ClockService";
import { InvalidPriceError } from "@domain/errors/actionPriceHistory/InvalidPriceError";
import { InvalidVolumeError } from "@domain/errors/actionPriceHistory/InvalidVolumeError";

type Props = {
  isin: string;
  date: Date;
  price: number;
  volume: number;
};

export class SeedActionPriceHistoryUseCase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly actionPriceHistoryRepository: ActionPriceHistoryRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}

  async execute({
    isin,
    date,
    price,
    volume,
  }: Props): Promise<
    void | ActionNotFoundError | InvalidPriceError | InvalidVolumeError
  > {
    const action = await this.actionRepository.findByISIN(isin);
    if (!action) return new ActionNotFoundError();
    const priceHistory = ActionPriceHistoryEntity.create({
      id: this.uuidService.generate(),
      isin,
      date,
      price,
      volume,
      createdAt: this.clockService.now(),
    });
    if (priceHistory instanceof Error) return priceHistory;

    await this.actionPriceHistoryRepository.save(priceHistory);
  }
}
