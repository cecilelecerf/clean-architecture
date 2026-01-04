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

export const actionFactory = () => {
  const client = new MySQLClient();
  const actionRepository = new ActionRepositoryMySQL(client);
  const actionPriceHistoryRepository = new ActionPriceHistoryRepositoryMySQL(
    client
  );
  const userRepository = new UserRepositoryMySQL(client);
  const clockService = new SystemClockService();

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

  return {
    admin: {
      createAction,
      updateAction,
    },
    getAllActionsByAvailability,
    getAction,
    getActionStat,
    getActionHistory,
  };
};
