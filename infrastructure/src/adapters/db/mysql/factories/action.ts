import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";

import { CreateActionUsecase } from "@application/usecases/actions/CreateActionUsecase";
import { ManageActionAvailabilityUsecase } from "@application/usecases/actions/ManageActionAvailabilityUsecase";

export const actionFactory = () => {
    const client = new MySQLClient();
    const actionRepository = new ActionRepositoryMySQL(client);
    const userRepository = new UserRepositoryMySQL(client);

    const createAction = new CreateActionUsecase(
        actionRepository,
        userRepository
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