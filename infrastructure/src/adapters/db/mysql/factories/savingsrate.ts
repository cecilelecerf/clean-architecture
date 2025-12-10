import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";

import { SetSavingsRateUsecase } from "@application/usecases/savingRates/SetSavingsRateUsecase";

export const savingsrateFactory = () => {
    const client = new MySQLClient();
    const userRepository = new UserRepositoryMySQL(client);
    const configRepository = new SavingsRateRepositoryMySQL(client);
    const uuidService = new NodeUuidService();

    const setSavingsRate = new SetSavingsRateUsecase(
        configRepository,
        userRepository,
        uuidService
    );

    return {
        admin: {
            setSavingsRate
        }
    };
}