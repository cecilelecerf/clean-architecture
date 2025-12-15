import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { SavingsRateRepositoryMongo } from "../repositories/SavingsRateRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { SetSavingsRateUsecase } from "@application/usecases/savingRates/SetSavingsRateUsecase";

export const savingsrateFactory = () => {
    const client = new MongoClient();
    const userRepository = new UserRepositoryMongo(client);
    const configRepository = new SavingsRateRepositoryMongo(client);
    const uuidService = new NodeUuidService();
    const clockService = new SystemClockService();

    const setSavingsRate = new SetSavingsRateUsecase(
        configRepository,
        userRepository,
        uuidService,
        clockService
    );

    return {
        admin: {
            setSavingsRate
        }
    };
}