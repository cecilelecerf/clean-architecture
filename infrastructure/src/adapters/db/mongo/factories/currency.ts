import { MongoClient } from "../../MongoClient";

import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

import { CreateCurrencyUseCase } from "@application/usecases/currency/CreateCurrencyUseCase";
import { UpdateCurrencyRateUseCase } from "@application/usecases/currency/UpdateCurrencyRateUseCase";
import { DeleteCurrencyUseCase } from "@application/usecases/currency/DeleteCurrencyUseCase";
import { GetCurrencyByCodeUseCase } from "@application/usecases/currency/GetCurrencyByCodeUseCase";
import { ListCurrenciesUseCase } from "@application/usecases/currency/ListCurrenciesUseCase";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { CurrencyRepositoryMongo } from "../repositories/CurrencyRepositoryMongo";

export const currencyFactory = () => {
  const client = new MongoClient();

  const userRepository = new UserRepositoryMongo(client);
  const currencyRepository = new CurrencyRepositoryMongo(client);
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
