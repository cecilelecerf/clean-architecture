import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { Money } from "@domain/values/Money";
import { IBAN } from "@domain/values/IBAN";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UuidService } from "@application/ports/services/UuidService";
import { ClockService } from "@application/ports/services/ClockService";

export interface SeedTransactionRequest {
  fromAccountId: IBAN;
  toAccountId: IBAN;
  amount: number;
  currency: string;
  label: string;
  icon: string;
  date?: Date;
}

export class SeedTransactionUseCase {
  constructor(
    private transactionRepository: TransactionRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedTransactionRequest): Promise<TransactionEntity> {
    const amount = Money.create({
      amount: request.amount,
      currency: request.currency,
    });
    if (amount instanceof Error) {
      throw new Error(`Invalid amount: ${request.amount}`);
    }

    const transaction = TransactionEntity.create({
      id: this.uuidService.generate(),
      fromAccountId: request.fromAccountId,
      toAccountId: request.toAccountId,
      amount,
      label: request.label,
      icon: request.icon,
      date: request.date ?? this.clockService.now(),
    });

    if (transaction instanceof Error) {
      throw transaction;
    }

    await this.transactionRepository.save(transaction);
    return transaction;
  }
}
