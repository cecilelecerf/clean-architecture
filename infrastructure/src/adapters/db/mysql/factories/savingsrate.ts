import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";

import { SetSavingsRateUsecase } from "@application/usecases/savingRates/SetSavingsRateUseCasee";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { GetAllSavingRatesUsecase } from "@application/usecases/savingRates/GetAllSavingRatesUsecase";
import { GetCurrentSavingRateUsecase } from "@application/usecases/savingRates/GetCurrentSavingRateUsecase";

export const savingsrateFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const savingRateRepo = new SavingsRateRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const setSavingsRate = new SetSavingsRateUsecase(
    savingRateRepo,
    userRepository,
    uuidService,
    clockService
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
