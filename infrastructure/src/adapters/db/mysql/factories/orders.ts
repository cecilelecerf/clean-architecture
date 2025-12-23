import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MySQLClient } from "../../MySQLClient";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";
import { PlaceOrderUseCase } from "@application/usecases/orders/PlaceOrderUseCase";
import { GetAllByUserUseCase } from "@application/usecases/orders/GetAllByUserUseCase";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { GetAllByActionUseCase } from "@application/usecases/orders/GetAllByActionUseCase";

export const orderFactory = () => { 
    const client = new MySQLClient();
    const userRepository = new UserRepositoryMySQL(client);
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

    const getAllByUser = new GetAllByUserUseCase(
        userRepository,
        orderRepository
    );

    const getAllByAction = new GetAllByActionUseCase(
        userRepository,
        orderRepository,
        actionRepository
    )

    return {
        client: {
            placeOrder,
            getAllByUser,
            getAllByAction
        }
    }
}