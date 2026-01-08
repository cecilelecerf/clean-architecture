import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { PlaceOrderUseCase } from "@application/usecases/orders/PlaceOrderUseCase";
import { MongoClient } from "../../MongoClient";
import { OrderRepositoryMongo } from "../repositories/OrderRepositoryMongo";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { GetAllByActionAndStatusAndUserIdUseCase } from "@application/usecases/orders/GetAllByActionAndStatusAndUserIdUseCase";
import { GetPortfolioUseCase } from "@application/usecases/orders/GetPorfolioUseCase";
import { GetPortoflioByISINUseCase } from "@application/usecases/orders/GetPortoflioByISINUseCase";
import { CancelledOrderUsecase } from "@application/usecases/orders/CancelledOrderUsecase";
import { GetOrderExecutedByDateRangeUsecase } from "@application/usecases/orders/GetOrderExecutedByDateRangeUsecase";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { TransactionRepositoryMongo } from "../repositories/TransactionRepositoryMongo";
import { MoneyConverterService } from "@infrastructure/adapters/services/MoneyConverterService";
import { CurrencyRepositoryMongo } from "../repositories/CurrencyRepositoryMongo";
import { GetAllByUserUseCase } from "@application/usecases/orders/GetAllByUserUseCase";

export const orderFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const orderRepository = new OrderRepositoryMongo(client);
  const actionRepository = new ActionRepositoryMongo(client);
  const accountRepo = new AccountRepositoryMongo(client);
  const transactionRepo = new TransactionRepositoryMongo(client);
  const currencyRepo = new CurrencyRepositoryMongo(client);
  const moneyConvertorService = new MoneyConverterService(currencyRepo);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const getAllByUser = new GetAllByUserUseCase(userRepository, orderRepository);

  const getAllByActionAndStatusAndUserId =
    new GetAllByActionAndStatusAndUserIdUseCase(
      userRepository,
      orderRepository,
      actionRepository
    );
  const getPorfolio = new GetPortfolioUseCase(
    orderRepository,
    actionRepository,
    userRepository
  );
  const getPortoflioByISIN = new GetPortoflioByISINUseCase(
    orderRepository,
    actionRepository,
    userRepository
  );
  const placeOrder = new PlaceOrderUseCase(
    actionRepository,
    accountRepo,
    userRepository,
    orderRepository,
    uuidService,
    clockService,
    moneyConvertorService,
    transactionRepo
  );
  const cancelledOrder = new CancelledOrderUsecase(
    userRepository,
    orderRepository,
    clockService
  );
  const getOrderHistory = new GetOrderExecutedByDateRangeUsecase(
    actionRepository,
    orderRepository,
    clockService
  );

  return {
    getPorfolio,
    getAllByUser,
    getAllByActionAndStatusAndUserId,
    getPortoflioByISIN,
    placeOrder,
    cancelledOrder,
    getOrderHistory,
  };
};
