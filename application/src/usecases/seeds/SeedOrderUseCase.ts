import { BankInterestAccountNotFoundError } from "@application/errors/accounts/BankInterestAccountNotFoundError";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { Money } from "@domain/values/Money";

export interface SeedOrderRequest {
  userId: string;
  actionId: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  date: Date;
  status: "pending" | "executed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private accountRepository: AccountRepository,
    private transactionRepository: TransactionRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedOrderRequest): Promise<OrderEntity> {
    const price = Money.create({
      amount: request.price,
      currency: request.currency,
    });
    if (price instanceof Error) {
      throw new Error(`Invalid price: ${request.price}`);
    }

    const fee = Money.create({
      amount: request.fee,
      currency: request.currency,
    });
    if (fee instanceof Error) {
      throw new Error(`Invalid fee: ${request.fee}`);
    }

    const clientAccount = await this.accountRepository.findByUserId(
      request.userId
    );
    const bankAccount = await this.accountRepository.findBankInterestAccount();
    if (!bankAccount) {
      throw new BankInterestAccountNotFoundError();
    }

    const amount = price.multiply(request.quantity);
    if (amount instanceof Error) throw new Error(`Invalid amount: ${amount}`);

    const now = this.clockService.now();
    const transaction = TransactionEntity.from({
      id: this.uuidService.generate(),
      label: "Achat d'action",
      icon: "",
      toAccountId: bankAccount.iban,
      fromAccountId: clientAccount[0].iban,
      amount,
      date: request.date,
    });

    const order = OrderEntity.from({
      id: this.uuidService.generate(),
      accountIban: clientAccount[0].iban,
      actionId: request.actionId,
      type: request.type,
      quantity: request.quantity,
      price,
      fee,
      date: request.date,
      status: request.status,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
      transactionId: transaction.id,
    });

    await this.transactionRepository.save(transaction);
    await this.orderRepository.save(order);
    return order;
  }
}
