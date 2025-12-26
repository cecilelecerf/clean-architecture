import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { OrderEntity } from "@domain/entities/OrderEntity";
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

    const now = this.clockService.now();

    const order = OrderEntity.from({
      id: this.uuidService.generate(),
      userId: request.userId,
      actionId: request.actionId,
      type: request.type,
      quantity: request.quantity,
      price,
      fee,
      date: request.date,
      status: request.status,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.orderRepository.save(order);
    return order;
  }
}
