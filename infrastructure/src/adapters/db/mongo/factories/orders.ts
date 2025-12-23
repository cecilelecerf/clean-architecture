import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { PlaceOrderUseCase } from "@application/usecases/orders/PlaceOrderUseCase";
import { MongoClient } from "../../MongoClient";
import { OrderRepositoryMongo } from "../repositories/OrderRepositoryMongo";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";

export const orderFactory = () => { 
    const client = new MongoClient();
    const orderRepository = new OrderRepositoryMongo(client);
    const actionRepository = new ActionRepositoryMongo(client);
    const uuidService = new NodeUuidService();
    const clockService = new SystemClockService();

    const placeOrder = new PlaceOrderUseCase(
        orderRepository,
        actionRepository,
        uuidService,
        clockService
    );

    return {
        client: {
            placeOrder
        }
    }
}