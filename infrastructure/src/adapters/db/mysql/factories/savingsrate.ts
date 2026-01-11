import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";

import { SetSavingsRateUsecase } from "@application/usecases/savingRates/SetSavingsRateUseCasee";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { GetAllSavingRatesUsecase } from "@application/usecases/savingRates/GetAllSavingRatesUsecase";
import { GetCurrentSavingRateUsecase } from "@application/usecases/savingRates/GetCurrentSavingRateUsecase";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";

export const savingsrateFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const savingRateRepo = new SavingsRateRepositoryMySQL(client);
  const accountRepository = new AccountRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  const emailService = new NodeEmailService();

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
