import { OrderEntity } from "@domain/entities/OrderEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { SeedOrderUseCase } from "@application/usecases/seeds/SeedOrderUseCase";
import { pick, rand } from "./utils";
import { ClockService } from "@application/ports/services/ClockService";
import { rawOrders } from "./raw/orders";

export async function generateOrders(
  clients: UserEntity[],
  actions: ActionEntity[],
  seedOrderUseCase: SeedOrderUseCase,
  clockService: ClockService
): Promise<OrderEntity[]> {
  console.log("-- Création des Ordres d'actions --");

  if (!clients.length || !actions.length) {
    throw new Error("Tu dois fournir au moins un client et une action.");
  }

  const orders: OrderEntity[] = [];

  for (const raw of rawOrders) {
    try {
      const user = pick(clients);
      const action = pick(actions);

      const createdAt = clockService.now();

      const order = await seedOrderUseCase.execute({
        userId: user.id,
        actionId: action.ISIN,
        type: raw.type as "buy" | "sell",
        quantity: raw.quantity,
        price: raw.price,
        fee: raw.fee,
        currency: raw.currency,
        date: raw.date,
        status: raw.status as "pending" | "executed" | "cancelled",
        createdAt,
        updatedAt:
          Math.random() < 0.3
            ? clockService.addDays(createdAt, rand(1, 10))
            : clockService.nowMinusDays(rand(0, 60)),
      });

      orders.push(order);
      console.log(
        `  ✅ Order created: ${order.type.toUpperCase()} ${order.quantity}x ${
          action.symbol
        } (${order.id})`
      );
    } catch (err) {
      console.warn(`  ⚠️  Failed to create order:`, err);
    }
  }

  console.log(`✅ Orders seed completed: ${orders.length} created\n`);
  return orders;
}
