import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MongoClient } from "../../MongoClient";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUsecase";
import { UpdateActionUsecase } from "@application/usecases/actions/UpdateActionUseCase";
import { GetAllActionsByAvailabilityUsecase } from "@application/usecases/actions/GetAllActionsByAvailabilityUseCase";

export const actionFactory = () => {
  const client = new MongoClient();
  const actionRepository = new ActionRepositoryMongo(client);
  const userRepository = new UserRepositoryMongo(client);
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
    client: {
      getAllActionsByAvailability,
    },
  };
};
