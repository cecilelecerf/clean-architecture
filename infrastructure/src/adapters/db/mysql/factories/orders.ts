import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MySQLClient } from "../../MySQLClient";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";
import { PlaceOrderUseCase } from "@application/usecases/orders/PlaceOrderUseCase";

export const orderFactory = () => { 
    const client = new MySQLClient();
    const orderRepository = new OrderRepositoryMySQL(client);
    const actionRepository = new ActionRepositoryMySQL(client);
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