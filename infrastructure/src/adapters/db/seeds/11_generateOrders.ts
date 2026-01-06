import { OrderEntity } from "@domain/entities/OrderEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import {
  SeedOrderUseCase,
  SeedOrderRequest,
} from "@application/usecases/seeds/SeedOrderUseCase";
import { ClockService } from "@application/ports/services/ClockService";
import { rand } from "./utils";

interface ActionInventory {
  [actionId: string]: {
    totalBought: number;
    totalSold: number;
    availableToSell: number;
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateBuyOrder(
  userId: string,
  action: ActionEntity,
  orderIndex: number,
  clockService: ClockService
): SeedOrderRequest {
  const quantity = randomInt(1, 20);
  const daysAgo = randomInt(30, 365) - orderIndex * 10;
  const date = clockService.nowMinusDays(Math.max(1, daysAgo));

  const priceVariation = randomFloat(0.8, 1.2);
  const historicalPrice = action.price.amount * priceVariation;

  const status = Math.random() < 0.8 ? "executed" : "pending";

  const order: SeedOrderRequest = {
    userId,
    actionId: action.ISIN,
    type: "buy",
    quantity,
    price: parseFloat(historicalPrice.toFixed(2)),
    currency: action.price.currency,
    date,
    status,
    createdAt: date,
    updatedAt: date,
    executionType: status === "executed" ? "market" : "limit",
  };

  if (status === "pending") {
    order.limitPrice = parseFloat(
      (action.price.amount * randomFloat(0.85, 0.95)).toFixed(2)
    );
  }

  return order;
}

function generateSellOrder(
  userId: string,
  action: ActionEntity,
  orderIndex: number,
  availableToSell: number,
  clockService: ClockService
): SeedOrderRequest | null {
  if (availableToSell <= 0) {
    return null;
  }

  const maxToSell = Math.min(availableToSell, 10);
  const quantity = randomInt(1, maxToSell);

  const daysAfterPurchase = randomInt(7, 180) - orderIndex * 5;
  const date = clockService.nowMinusDays(Math.max(1, daysAfterPurchase));

  const priceVariation = randomFloat(0.85, 1.15);
  const sellPrice = action.price.amount * priceVariation;

  const status = Math.random() < 0.9 ? "executed" : "pending";

  const order: SeedOrderRequest = {
    userId,
    actionId: action.ISIN,
    type: "sell",
    quantity,
    price: parseFloat(sellPrice.toFixed(2)),
    currency: action.price.currency,
    date,
    status,
    createdAt: date,
    updatedAt: date,
    executionType: status === "executed" ? "market" : "limit",
  };

  if (status === "pending") {
    order.limitPrice = parseFloat(
      (action.price.amount * randomFloat(1.05, 1.15)).toFixed(2)
    );
  }

  return order;
}

function generateOrdersForUser(
  userId: string,
  actions: ActionEntity[],
  clockService: ClockService,
  options: {
    minBuyOrdersPerAction?: number;
    maxBuyOrdersPerAction?: number;
    sellProbability?: number;
  } = {}
): { orders: SeedOrderRequest[]; inventory: ActionInventory } {
  const {
    minBuyOrdersPerAction = 1,
    maxBuyOrdersPerAction = 5,
    sellProbability = 0.4,
  } = options;

  const orders: SeedOrderRequest[] = [];
  const inventory: ActionInventory = {};

  for (const action of actions) {
    inventory[action.ISIN] = {
      totalBought: 0,
      totalSold: 0,
      availableToSell: 0,
    };

    const numBuyOrders = randomInt(
      minBuyOrdersPerAction,
      maxBuyOrdersPerAction
    );

    for (let i = 0; i < numBuyOrders; i++) {
      const buyOrder = generateBuyOrder(userId, action, i, clockService);
      orders.push(buyOrder);

      inventory[action.ISIN].totalBought += buyOrder.quantity;
      inventory[action.ISIN].availableToSell += buyOrder.quantity;

      if (Math.random() < sellProbability) {
        const sellOrder = generateSellOrder(
          userId,
          action,
          i,
          inventory[action.ISIN].availableToSell,
          clockService
        );
        if (sellOrder) {
          orders.push(sellOrder);

          inventory[action.ISIN].totalSold += sellOrder.quantity;
          inventory[action.ISIN].availableToSell -= sellOrder.quantity;
        }
      }
    }
  }

  orders.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { orders, inventory };
}

function validateInventory(inventory: ActionInventory): boolean {
  return Object.values(inventory).every(
    (inv) => inv.totalSold <= inv.totalBought && inv.availableToSell >= 0
  );
}

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

  for (const client of clients) {
    try {
      const numActions = rand(3, Math.min(10, actions.length));
      const userActions: ActionEntity[] = [];
      const shuffledActions = [...actions].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numActions; i++) {
        userActions.push(shuffledActions[i]);
      }

      const { orders: orderRequests, inventory } = generateOrdersForUser(
        client.id,
        userActions,
        clockService,
        {
          minBuyOrdersPerAction: 1,
          maxBuyOrdersPerAction: 5,
          sellProbability: 0.4,
        }
      );

      if (!validateInventory(inventory)) {
        console.warn(
          `  ⚠️  Inventaire incohérent pour client ${client.email}, skip`
        );
        continue;
      }

      for (const orderRequest of orderRequests) {
        try {
          const order = await seedOrderUseCase.execute(orderRequest);
          orders.push(order);

          const action = actions.find((a) => a.ISIN === order.ISIN);
          const executionInfo =
            order.executionType === "limit" && order.limitPrice
              ? ` @ limit ${order.limitPrice.amount}€`
              : "";
          console.log(
            `  ✅ Order created: ${order.type.toUpperCase()} ${
              order.quantity
            }x ${action?.symbol || order.ISIN} (${order.status}${
              order.executionType === "limit" ? " - LIMIT" : ""
            }${executionInfo}) for ${client.email}`
          );
        } catch (err) {
          console.warn(`  ⚠️  Failed to create order:`, err);
        }
      }

      // Afficher le résumé de l'inventaire pour ce client
      console.log(`  📊 Inventaire pour ${client.email}:`);
      Object.entries(inventory).forEach(([isin, inv]) => {
        const action = actions.find((a) => a.ISIN === isin);
        console.log(
          `     ${action?.symbol || isin}: ${inv.totalBought} achetées, ${
            inv.totalSold
          } vendues, ${inv.availableToSell} disponibles`
        );
      });
    } catch (err) {
      console.warn(
        `  ⚠️  Failed to generate orders for client ${client.email}:`,
        err
      );
    }
  }

  console.log(`✅ Orders seed completed: ${orders.length} created\n`);
  return orders;
}
