import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MongoClient } from "../../MongoClient";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUsecase";
import { ManageActionAvailabilityUsecase } from "@application/usecases/actions/ManageActionAvailabilityUsecase";

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
    
    const manageActionAvailability = new ManageActionAvailabilityUsecase(
        actionRepository
    );

    return {
        admin: {
            manageActionAvailability,
            createAction
        }
    };
}