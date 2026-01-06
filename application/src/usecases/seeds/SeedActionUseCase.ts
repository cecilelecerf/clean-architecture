import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { Money } from "@domain/values/Money";
export interface SeedActionRequest {
  ISIN: string;
  name: string;
  symbol: string;
  market: string;
  activitySector: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedActionUseCase {
  constructor(
    private actionRepository: ActionRepository,
    private clockService: ClockService
  ) {}

  async execute(request: SeedActionRequest): Promise<ActionEntity> {
    const price = Money.create({
      amount: request.price,
      currency: request.currency,
    });

    if (price instanceof Error) {
      throw new Error(`Invalid current price: ${request.price}`);
    }

    const now = this.clockService.now();

    const action = ActionEntity.from({
      ISIN: request.ISIN,
      name: request.name,
      symbol: request.symbol,
      market: request.market,
      activitySector: request.activitySector,
      price,
      isAvailable: request.isAvailable,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.actionRepository.save(action);
    return action;
  }
}
