import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MySQLClient } from "../../MySQLClient";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";
import { GetAllByUserUseCase } from "@application/usecases/orders/GetAllByUserUseCase";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { GetAllByActionAndStatusAndUserIdUseCase } from "@application/usecases/orders/GetAllByActionAndStatusAndUserIdUseCase";
import { GetPortfolioUseCase } from "@application/usecases/orders/GetPorfolioUseCase";
import { GetPortoflioByISINUseCase } from "@application/usecases/orders/GetPortoflioByISINUseCase";
import { CurrencyRepositoryMySQL } from "../repositories/CurrencyRepositoryMySQL";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { MoneyConverterService } from "@infrastructure/adapters/services/MoneyConverterService";
import { PlaceOrderUseCase } from "@application/usecases/orders/PlaceOrderUseCase";
import { CancelledOrderUsecase } from "@application/usecases/orders/CancelledOrderUsecase";
import { GetOrderExecutedByDateRangeUsecase } from "@application/usecases/orders/GetOrderExecutedByDateRangeUsecase";

export const orderFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const orderRepository = new OrderRepositoryMySQL(client);
  const actionRepository = new ActionRepositoryMySQL(client);

  const accountRepo = new AccountRepositoryMySQL(client);
  const transactionRepo = new TransactionRepositoryMySQL(client);
  const currencyRepo = new CurrencyRepositoryMySQL(client);
  const clockService = new SystemClockService();
  const uuidService = new NodeUuidService();
  const moneyConvertorService = new MoneyConverterService(currencyRepo);
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
