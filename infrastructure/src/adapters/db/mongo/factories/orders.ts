import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { PlaceOrderUseCase } from "@application/usecases/orders/PlaceOrderUseCase";
import { MongoClient } from "../../MongoClient";
import { OrderRepositoryMongo } from "../repositories/OrderRepositoryMongo";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { GetAllByUserUseCase } from "@application/usecases/orders/GetAllByUserUseCase";
import { GetAllByActionUseCase } from "@application/usecases/orders/GetAllByActionUseCase";

export const orderFactory = () => { 
    const client = new MongoClient();
    const userRepository = new UserRepositoryMongo(client);
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