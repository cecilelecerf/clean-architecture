import { OrderEntity } from "@domain/entities/OrderEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { rawOrders } from "../../seeds/orders";
import { Money } from "@domain/values/Money";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { pick, rand } from "./utils";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export async function generateOrders(
  mysqlClient: MySQLClient,
  clients: UserEntity[],
  actions: ActionEntity[],
): Promise<OrderEntity[]> {
    console.log("-- Création des Ordres d'actions --");

    const orderRepository = new OrderRepositoryMySQL(mysqlClient);
    const uuidService = new NodeUuidService();
    const clockService = new SystemClockService();

    const orders = [];
    for (const raw of rawOrders) {
        try {
            const price = Money.create({
                amount: raw.price,
                currency: raw.currency,
            });
            if (price instanceof Error) {
                console.warn(price);
                continue;
            }

            const fee = Money.create({
                amount: raw.fee,
                currency: raw.currency,
            });
            if (fee instanceof Error) {
                console.warn(fee);
                continue;
            }

            const user = pick(clients);
            const action = pick(actions);

            if (!user || !action) {
                console.warn("Utilisateur ou action manquant pour l'ordre");
                continue;
            }
                const createdAt =  clockService.now()
            const order = OrderEntity.from({
                id: uuidService.generate(),
                userId: user.id,
                actionId: action.ISIN,
                type: raw.type as "buy" | "sell",
                quantity: raw.quantity,
                price: price,
                fee: fee,
                date: raw.date,
                status: raw.status as "pending" | "executed" | "cancelled",
                createdAt,
                updatedAt:   Math.random() < 0.3
                        ? clockService.addDays(createdAt, rand(1, 10))
                        :  clockService.nowMinusDays(rand(0, 60))
            });
                        
            orders.push(order);
            await orderRepository.save(order);
            console.log(order.id);
        } catch (err) {
            console.error("Error creating orders from raw", raw, err);
        }
    }
    return orders;
}