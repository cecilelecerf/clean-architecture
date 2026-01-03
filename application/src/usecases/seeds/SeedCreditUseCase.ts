// application/usecases/seeds/SeedCreditUseCase.ts
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export type SeedCreditType =
  | "active"
  | "future"
  | "pending"
  | "refused"
  | "completed";

export interface SeedCreditRequest {
  userId: string;
  advisorId?: string | null;
  initialAmount: number;
  currency: string;
  interestRate: number;
  insuranceRate: number;
  durationMonths: number;
  creditType: SeedCreditType;
}

interface CreditDates {
  status: CreditStatus;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SeedCreditUseCase {
  constructor(
    private creditRepository: CreditRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedCreditRequest): Promise<CreditEntity> {
    const initialAmount = Money.create({
      amount: request.initialAmount,
      currency: request.currency,
    });
    if (initialAmount instanceof Error) {
      throw new Error(`Invalid initial amount: ${request.initialAmount}`);
    }

    const interestRate = Percentage.create(request.interestRate);
    if (interestRate instanceof Error) {
      throw new Error(`Invalid interest rate: ${request.interestRate}`);
    }

    const insuranceRate = Percentage.create(request.insuranceRate);
    if (insuranceRate instanceof Error) {
      throw new Error(`Invalid insurance rate: ${request.insuranceRate}`);
    }

    // Génération des dates selon le type de crédit
    const dates = this.generateCreditDates(
      request.creditType,
      request.durationMonths
    );

    const credit = CreditEntity.create({
      id: this.uuidService.generate(),
      userId: request.userId,
      advisorId: request.advisorId ?? null,
      initialAmount,
      interestRate,
      insuranceRate,
      durationMonths: request.durationMonths,
      startDate: dates.startDate,
      status: dates.status,
      createdAt: dates.createdAt,
      updatedAt: dates.updatedAt,
    });

    if (credit instanceof Error) {
      throw credit;
    }

    // Calcul du solde restant pour les crédits actifs
    if (request.creditType === "active") {
      this.calculateRemainingBalance(
        credit,
        dates.startDate,
        request.durationMonths
      );
    }

    await this.creditRepository.save(credit);
    return credit;
  }

  private generateCreditDates(
    creditType: SeedCreditType,
    durationMonths: number
  ): CreditDates {
    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const now = this.clockService.now();

    switch (creditType) {
      case "active": {
        const monthsElapsed = rand(3, 12);
        const startDate = this.clockService.nowMinusMonths(monthsElapsed);
        const createdAt = this.clockService.addDays(startDate, -rand(30, 90));
        return {
          status: CreditStatus.ACCEPTED,
          startDate,
          createdAt,
          updatedAt: now,
        };
      }

      case "pending": {
        const createdAt = this.clockService.nowMinusDays(rand(1, 15));
        const startDate = this.clockService.addDays(now, rand(30, 60));
        return {
          status: CreditStatus.PENDING,
          startDate,
          createdAt,
          updatedAt: createdAt,
        };
      }

      case "future": {
        const createdAt = this.clockService.nowMinusDays(rand(15, 45));
        const startDate = this.clockService.addDays(now, rand(60, 180));
        return {
          status: CreditStatus.ACCEPTED,
          startDate,
          createdAt,
          updatedAt: now,
        };
      }

      case "refused": {
        const createdAt = this.clockService.nowMinusDays(rand(20, 60));
        const startDate = this.clockService.addDays(createdAt, rand(30, 60));
        return {
          status: CreditStatus.REFUSED,
          startDate,
          createdAt,
          updatedAt: now,
        };
      }

      case "completed": {
        const startDate = this.clockService.nowMinusMonths(
          durationMonths + rand(1, 6)
        );
        const createdAt = this.clockService.addDays(startDate, -rand(30, 90));
        return {
          status: CreditStatus.COMPLETED,
          startDate,
          createdAt,
          updatedAt: now,
        };
      }

      default:
        throw new Error(`Unknown credit type: ${creditType}`);
    }
  }

  private calculateRemainingBalance(
    credit: CreditEntity,
    startDate: Date,
    durationMonths: number
  ): void {
    const now = this.clockService.now();
    const monthsElapsed = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const monthsRemaining = Math.max(0, durationMonths - monthsElapsed);
    const remainingAmount = Math.max(
      0,
      credit.monthlyPayment.amount * monthsRemaining
    );

    const remainingBalance = Money.create({
      amount: remainingAmount,
      currency: credit.initialAmount.currency,
    });

    if (remainingBalance instanceof Error) {
      throw remainingBalance;
    }

    credit.remainingBalance = remainingBalance;
  }
}
