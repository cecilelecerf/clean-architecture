import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";

import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUseCasee";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { GetAllActionsByAvailabilityUsecase } from "@application/usecases/actions/GetAllActionsByAvailabilityUseCase";
import { UpdateActionUsecase } from "@application/usecases/actions/UpdateActionUseCase";
import { GetActionUsecase } from "@application/usecases/actions/GetActionUsecase";
import { GetActionStatisticsUsecase } from "@application/usecases/actions/GetActionStatisticsUsecase";
import { GetActionPriceHistoryUsecase } from "@application/usecases/actions/GetActionPriceHistoryUsecase";
import { ActionPriceHistoryRepositoryMySQL } from "../repositories/ActionPriceHistoryRepositoryMySQL";
import { BuyActionUseCase } from "@application/usecases/actions/BuyActionUseCase";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { SellActionUseCase } from "@application/usecases/actions/SellActionUseCase";
import { GetActionSuggestionsUseCase } from "@application/usecases/actions/GetActionSuggestionsUseCase";

export const actionFactory = () => {
  const client = new MySQLClient();
  const actionRepository = new ActionRepositoryMySQL(client);
  const accountRepo = new AccountRepositoryMySQL(client);
  const transactionRepo = new TransactionRepositoryMySQL(client);
  const orderRepo = new OrderRepositoryMySQL(client);
  const actionPriceHistoryRepository = new ActionPriceHistoryRepositoryMySQL(
    client
  );

  const userRepository = new UserRepositoryMySQL(client);
  const clockService = new SystemClockService();
  const uuidService = new NodeUuidService();

  const createAction = new CreateActionUsecase(
    actionRepository,
    userRepository,
    clockService
  );

  const updateAction = new UpdateActionUsecase(
    actionRepository,
    userRepository,
    clockService
  );

  const getAllActionsByAvailability = new GetAllActionsByAvailabilityUsecase(
    actionRepository,
    userRepository
  );
  const getAction = new GetActionUsecase(actionRepository, userRepository);
  const getActionStat = new GetActionStatisticsUsecase(
    actionRepository,
    clockService
  );
  const getActionHistory = new GetActionPriceHistoryUsecase(
    actionRepository,
    actionPriceHistoryRepository,
    clockService
  );
  const buy = new BuyActionUseCase(
    actionRepository,
    accountRepo,
    userRepository,
    transactionRepo,
    orderRepo,
    uuidService,
    clockService
  );

  const sell = new SellActionUseCase(
    actionRepository,
    accountRepo,
    userRepository,
    transactionRepo,
    orderRepo,
    uuidService,
    clockService
  );

  const suggestion = new GetActionSuggestionsUseCase(
    actionRepository,
    actionPriceHistoryRepository,
    clockService
  );

  return {
    admin: {
      createAction,
      updateAction,
    },
    getAllActionsByAvailability,
    getAction,
    getActionStat,
    getActionHistory,
    buy,
    sell,
    suggestion,
  };
};
