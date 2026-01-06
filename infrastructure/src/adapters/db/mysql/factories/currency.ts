import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { CurrencyRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/CurrencyRepositoryMySQL";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

import { CreateCurrencyUseCase } from "@application/usecases/currency/CreateCurrencyUseCase";
import { UpdateCurrencyRateUseCase } from "@application/usecases/currency/UpdateCurrencyRateUseCase";
import { DeleteCurrencyUseCase } from "@application/usecases/currency/DeleteCurrencyUseCase";
import { GetCurrencyByCodeUseCase } from "@application/usecases/currency/GetCurrencyByCodeUseCase";
import { ListCurrenciesUseCase } from "@application/usecases/currency/ListCurrenciesUseCase";

export const currencyFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const currencyRepository = new CurrencyRepositoryMySQL(client);
  const clockService = new SystemClockService();

  const createCurrency = new CreateCurrencyUseCase(
    currencyRepository,
    userRepository,
    clockService
  );

  const updateCurrencyRate = new UpdateCurrencyRateUseCase(
    currencyRepository,
    userRepository,
    clockService
  );

  const deleteCurrency = new DeleteCurrencyUseCase(
    currencyRepository,
    userRepository
  );

  const getCurrencyByCode = new GetCurrencyByCodeUseCase(currencyRepository);

  const listCurrencies = new ListCurrenciesUseCase(currencyRepository);

  return {
    admin: {
      createCurrency,
      updateCurrencyRate,
      deleteCurrency,
    },

    getCurrencyByCode,
    listCurrencies,
  };
};
