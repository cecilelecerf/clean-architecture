import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { SavingsRateRepositoryMongo } from "../repositories/SavingsRateRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { SetSavingsRateUsecase } from "@application/usecases/savingRates/SetSavingsRateUseCasee";
import { GetAllSavingRatesUsecase } from "@application/usecases/savingRates/GetAllSavingRatesUsecase";
import { GetCurrentSavingRateUsecase } from "@application/usecases/savingRates/GetCurrentSavingRateUsecase";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";

export const savingsrateFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const accountRepository = new AccountRepositoryMongo(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  const emailService = new NodeEmailService();
  const savingRateRepo = new SavingsRateRepositoryMongo(client);

  const setSavingsRate = new SetSavingsRateUsecase(
    savingRateRepo,
    userRepository,
    accountRepository,
    uuidService,
    clockService,
    emailService
  );

  const getAll = new GetAllSavingRatesUsecase(savingRateRepo, userRepository);
  const getCurrent = new GetCurrentSavingRateUsecase(
    savingRateRepo,
    userRepository,
    clockService
  );
  return {
    setSavingsRate,
    getAll,
    getCurrent,
  };
};
