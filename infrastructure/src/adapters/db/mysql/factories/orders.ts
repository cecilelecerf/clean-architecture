import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MySQLClient } from "../../MySQLClient";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";
import { GetAllByUserUseCase } from "@application/usecases/orders/GetAllByUserUseCase";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { GetAllByActionUseCase } from "@application/usecases/orders/GetAllByActionUseCase";
import { GetPortfolioUseCase } from "@application/usecases/orders/GetPorfolioUseCase";
export const orderFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const orderRepository = new OrderRepositoryMySQL(client);
  const actionRepository = new ActionRepositoryMySQL(client);
  const getAllByUser = new GetAllByUserUseCase(userRepository, orderRepository);

  const getAllByAction = new GetAllByActionUseCase(
    userRepository,
    orderRepository,
    actionRepository
  );
  const getPorfolio = new GetPortfolioUseCase(
    orderRepository,
    actionRepository,
    userRepository
  );

  return {
    getPorfolio,
    getAllByUser,
    getAllByAction,
  };
};
