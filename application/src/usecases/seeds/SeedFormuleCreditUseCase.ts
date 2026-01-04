import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { Percentage } from "@domain/values/Percentage";
import { Money } from "@domain/values/Money";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { IBAN } from "@domain/values/IBAN";
import { FormuleType } from "@domain/values/FormuleType";

export interface SeedFormuleCreditRequest {
  type: string;
  label: string;
  description: string;
  interestRate: number;
  insuranceRate: number;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  isActive: boolean;
  accountId: IBAN;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedFormuleCreditUseCase {
  constructor(
    private formuleCreditRepository: FormuleCreditRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(
    request: SeedFormuleCreditRequest
  ): Promise<FormuleCreditEntity> {
    const interestRate = Percentage.create(request.interestRate);
    if (interestRate instanceof Error) {
      throw new Error(`Invalid interest rate: ${request.interestRate}`);
    }

    const insuranceRate = Percentage.create(request.insuranceRate);
    if (insuranceRate instanceof Error) {
      throw new Error(`Invalid insurance rate: ${request.insuranceRate}`);
    }

    const minAmount =
      request.minAmount && request.currency
        ? Money.create({
            amount: request.minAmount,
            currency: request.currency,
          })
        : undefined;

    if (minAmount instanceof Error) {
      throw new Error(`Invalid min amount: ${request.minAmount}`);
    }

    const maxAmount =
      request.maxAmount && request.currency
        ? Money.create({
            amount: request.maxAmount,
            currency: request.currency,
          })
        : undefined;

    if (maxAmount instanceof Error) {
      throw new Error(`Invalid max amount: ${request.maxAmount}`);
    }

    const type = FormuleType.create(request.type);
    if (type instanceof Error) {
      throw new Error(` ${request.type}`);
    }

    if (maxAmount instanceof Error) {
      throw new Error(`Invalid max amount: ${request.maxAmount}`);
    }

    const now = this.clockService.now();

    const formuleCredit = FormuleCreditEntity.from({
      id: this.uuidService.generate(),
      type,
      label: request.label,
      description: request.description,
      interestRate,
      insuranceRate,
      minAmount,
      maxAmount,
      currency: request.currency,
      isActive: request.isActive,
      accountId: request.accountId,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.formuleCreditRepository.save(formuleCredit);
    return formuleCredit;
  }
}
