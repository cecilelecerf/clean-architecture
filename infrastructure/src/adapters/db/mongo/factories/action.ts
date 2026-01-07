import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MongoClient } from "../../MongoClient";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUseCasee";
import { UpdateActionUsecase } from "@application/usecases/actions/UpdateActionUseCase";
import { GetAllActionsByAvailabilityUsecase } from "@application/usecases/actions/GetAllActionsByAvailabilityUseCase";
import { GetActionUsecase } from "@application/usecases/actions/GetActionUsecase";
import { GetActionStatisticsUseCase } from "@application/usecases/actions/GetActionStatisticsUsecase";
import { GetActionSuggestionsUseCase } from "@application/usecases/actions/GetActionSuggestionsUseCase";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { OrderRepositoryMongo } from "../repositories/OrderRepositoryMongo";
import { MoneyConverterService } from "@infrastructure/adapters/services/MoneyConverterService";
import { CurrencyRepositoryMongo } from "../repositories/CurrencyRepositoryMongo";

export const actionFactory = () => {
  const client = new MongoClient();
  const actionRepository = new ActionRepositoryMongo(client);
  const userRepository = new UserRepositoryMongo(client);
  const accountRepo = new AccountRepositoryMongo(client);
  const orderRepo = new OrderRepositoryMongo(client);
  const clockService = new SystemClockService();
  const currencyRepo = new CurrencyRepositoryMongo(client);
  const moneyConvertorService = new MoneyConverterService(currencyRepo);

  const createAction = new CreateActionUsecase(
    actionRepository,
    userRepository,
    clockService,
    accountRepo
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
