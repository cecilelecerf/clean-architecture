import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";
import { Money } from "@domain/values/Money";

export type SeedCreditType =
  | "active"
  | "pending"
  | "future"
  | "refused"
  | "completed";

export interface SeedCreditRequest {
  userId: string;
  advisorId: string | null;
  formuleCreditId: string;
  initialAmount: number;
  currency: string;
  durationMonths: number;
  creditType: SeedCreditType;
}

export class SeedCreditUseCase {
  constructor(
    private creditRepository: CreditRepository,
    private formuleCreditRepository: FormuleCreditRepository,
    private accountRepository: AccountRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedCreditRequest): Promise<CreditEntity> {
    const formuleCredit = await this.formuleCreditRepository.findById(
      request.formuleCreditId
    );
    if (!formuleCredit) {
      throw new Error(`FormuleCredit not found: ${request.formuleCreditId}`);
    }

    if (!formuleCredit.isActive) {
      throw new Error(`FormuleCredit is inactive: ${request.formuleCreditId}`);
    }
    const accounts = await this.accountRepository.findByUserId(request.userId);
    if (!accounts || accounts.length === 0) {
      throw new Error(`No account found for user: ${request.userId}`);
    }

    const account = accounts[0];
    const initialAmount = Money.create({
      amount: request.initialAmount,
      currency: request.currency,
    });
    if (initialAmount instanceof Error) {
      throw initialAmount;
    }

    if (
      formuleCredit.minAmount &&
      initialAmount.amount < formuleCredit.minAmount.amount
    ) {
      throw new Error(
        `Amount ${initialAmount.amount} is below minimum ${formuleCredit.minAmount.amount}`
      );
    }
    if (
      formuleCredit.maxAmount &&
      initialAmount.amount > formuleCredit.maxAmount.amount
    ) {
      throw new Error(
        `Amount ${initialAmount.amount} exceeds maximum ${formuleCredit.maxAmount.amount}`
      );
    }

    const now = this.clockService.now();
    let startDate: Date;
    let status: CreditStatus;
    let reason: string | null = null;

    switch (request.creditType) {
      case "active":
        status = CreditStatus.ACCEPTED;
        startDate = this.clockService.addMonths(now, -6);
        break;
      case "pending":
        status = CreditStatus.PENDING;
        startDate = this.clockService.addMonths(now, 1);
        break;
      case "future":
        status = CreditStatus.ACCEPTED;
        startDate = this.clockService.addMonths(now, 2);
        break;
      case "refused":
        status = CreditStatus.REFUSED;
        startDate = this.clockService.addMonths(now, 1);
        reason = "Capacité d'endettement insuffisante";
        break;
      case "completed":
        status = CreditStatus.COMPLETED;
        startDate = this.clockService.addMonths(now, -request.durationMonths);
        break;
      default:
        throw new Error(`Unknown credit type: ${request.creditType}`);
    }
    const credit = CreditEntity.create(
      {
        id: this.uuidService.generate(),
        advisorId: request.advisorId,
        accountId: account.iban,
        formuleCreditId: formuleCredit.id,
        initialAmount,
        durationMonths: request.durationMonths,
        startDate,
        status,
        createdAt: now,
        reason,
      },
      formuleCredit.interestRate,
      formuleCredit.insuranceRate
    );

    if (credit instanceof Error) {
      throw credit;
    }

    if (request.creditType === "active") {
      const monthsPaid = 6;
      for (let i = 0; i < monthsPaid; i++) {
        const payResult = credit.payMonthly(
          formuleCredit.interestRate,
          formuleCredit.insuranceRate
        );
        if (payResult instanceof Error) {
          throw payResult;
        }
      }
    }

    if (request.creditType === "completed") {
      for (let i = 0; i < request.durationMonths; i++) {
        const payResult = credit.payMonthly(
          formuleCredit.interestRate,
          formuleCredit.insuranceRate
        );
        if (payResult instanceof Error) {
          throw payResult;
        }
      }
    }

    await this.creditRepository.save(credit);
    return credit;
  }
}
