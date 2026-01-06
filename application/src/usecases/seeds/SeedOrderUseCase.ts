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
  currency: string;
  date: Date;
  status: "pending" | "executed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
  transactionId?: string;
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

    const clientAccount = await this.accountRepository.findByUserId(
      request.userId
    );
    if (!clientAccount || clientAccount.length === 0) {
      throw new Error(`User account not found for userId: ${request.userId}`);
    }

    const now = this.clockService.now();
    let transactionId: string | undefined;

    if (request.status === "executed") {
      const bankAccount =
        await this.accountRepository.findBankInterestAccount();
      if (!bankAccount) {
        throw new BankInterestAccountNotFoundError();
      }

      const amount = price.multiply(request.quantity);
      if (amount instanceof Error) {
        throw new Error(`Invalid amount calculation`);
      }

      const transaction = TransactionEntity.from({
        id: request.transactionId ?? this.uuidService.generate(),
        label:
          request.type === "buy"
            ? `Achat ${request.quantity} action(s)`
            : `Vente ${request.quantity} action(s)`,
        icon: request.type === "buy" ? "📈" : "📉",
        fromAccountId:
          request.type === "buy" ? clientAccount[0].iban : bankAccount.iban,
        toAccountId:
          request.type === "buy" ? bankAccount.iban : clientAccount[0].iban,
        amount,
        date: request.date,
      });

      await this.transactionRepository.save(transaction);
      transactionId = transaction.id;
    }

    const order = OrderEntity.from({
      id: this.uuidService.generate(),
      IBAN: clientAccount[0].iban,
      ISIN: request.actionId,
      type: request.type,
      quantity: request.quantity,
      price,
      date: request.date,
      status: request.status,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
      transactionId,
    });

    await this.orderRepository.save(order);
    return order;
  }
}
