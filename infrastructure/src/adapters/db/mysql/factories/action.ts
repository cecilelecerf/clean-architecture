import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";

import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUseCasee";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { GetAllActionsByAvailabilityUsecase } from "@application/usecases/actions/GetAllActionsByAvailabilityUseCase";
import { UpdateActionUsecase } from "@application/usecases/actions/UpdateActionUseCase";
import { GetActionUsecase } from "@application/usecases/actions/GetActionUsecase";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { GetActionSuggestionsUseCase } from "@application/usecases/actions/GetActionSuggestionsUseCase";
import { MoneyConverterService } from "@infrastructure/adapters/services/MoneyConverterService";
import { CurrencyRepositoryMySQL } from "../repositories/CurrencyRepositoryMySQL";
import { GetActionStatisticsUseCase } from "@application/usecases/actions/GetActionStatisticsUsecase";

export const actionFactory = () => {
  const client = new MySQLClient();
  const actionRepository = new ActionRepositoryMySQL(client);
  const accountRepo = new AccountRepositoryMySQL(client);
  const transactionRepo = new TransactionRepositoryMySQL(client);
  const orderRepo = new OrderRepositoryMySQL(client);

  const currencyRepo = new CurrencyRepositoryMySQL(client);
  const userRepository = new UserRepositoryMySQL(client);
  const clockService = new SystemClockService();
  const uuidService = new NodeUuidService();
  const moneyConvertorService = new MoneyConverterService(currencyRepo);

  const createAction = new CreateActionUsecase(
    actionRepository,
    userRepository,
    clockService
  );

  const updateAction = new UpdateActionUsecase(
    actionRepository,
    userRepository,
    clockService,
    orderRepo,
    accountRepo,
    uuidService,
    transactionRepo,
    moneyConvertorService
  );

  const getAllActionsByAvailability = new GetAllActionsByAvailabilityUsecase(
    actionRepository,
    userRepository
  );
  const getAction = new GetActionUsecase(actionRepository, userRepository);
  const getActionStat = new GetActionStatisticsUseCase(
    actionRepository,
    orderRepo,
    clockService,
    moneyConvertorService
  );

  const suggestion = new GetActionSuggestionsUseCase(
    actionRepository,
    orderRepo,
    clockService,
    moneyConvertorService
  );

  return {
    admin: {
      createAction,
      updateAction,
    },
    getAllActionsByAvailability,
    getAction,
    getActionStat,
    suggestion,
  };
};
