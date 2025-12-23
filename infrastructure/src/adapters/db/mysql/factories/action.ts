import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";

import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUseCasee";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { GetAllActionsByAvailabilityUsecase } from "@application/usecases/actions/GetAllActionsByAvailabilityUseCase";
import { UpdateActionUsecase } from "@application/usecases/actions/UpdateActionUseCase";

export const actionFactory = () => {
  const client = new MySQLClient();
  const actionRepository = new ActionRepositoryMySQL(client);
  const userRepository = new UserRepositoryMySQL(client);
  const clockService = new SystemClockService();

  const createAction = new CreateActionUsecase(
    actionRepository,
    userRepository,
    clockService
  );

  const updateAction = new UpdateActionUsecase(
    actionRepository,
    userRepository
  );

  const getAllActionsByAvailability = new GetAllActionsByAvailabilityUsecase(
    actionRepository,
    userRepository
  );

  return {
    admin: {
      createAction,
      updateAction,
    },
    getAllActionsByAvailability,
  };
};
