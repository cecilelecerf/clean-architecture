import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";

import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUsecase";
import { ManageActionAvailabilityUsecase } from "@application/usecases/actions/ManageActionAvailabilityUsecase";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

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