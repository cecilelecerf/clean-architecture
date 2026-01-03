import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { Percentage } from "@domain/values/Percentage";

export interface SeedSavingsRateRequest {
  rate: number;
  effectiveDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedSavingsRateUseCase {
  constructor(
    private savingsRateRepository: SavingRateRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedSavingsRateRequest): Promise<SavingsRateEntity> {
    const rate = Percentage.create(request.rate);
    if (rate instanceof Error) {
      throw new Error(`Invalid rate: ${request.rate}`);
    }

    const now = this.clockService.now();

    const savingsRate = SavingsRateEntity.from({
      id: this.uuidService.generate(),
      rate,
      effectiveDate: request.effectiveDate,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.savingsRateRepository.save(savingsRate);
    return savingsRate;
  }
}
