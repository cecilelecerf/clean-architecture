import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";

import { ApplyDailyInterestUseCase } from "@application/usecases/accounts/ApplyDailyInterestUseCase";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";
import { CreateAccountUseCase } from "@application/usecases/accounts/CreateAccountUseCasee";
import { DeleteAccountUseCase } from "@application/usecases/accounts/DeleteAccountUseCasee";
import { GetAccountByIBANUseCase } from "@application/usecases/accounts/GetAccountByIBANUseCase";
import { GetAccountsUseCase } from "@application/usecases/accounts/GetAccountsUseCase";
import { TransfertBetweenAccountUseCase } from "@application/usecases/accounts/TransfertBetweenAccountUseCasee";
import { GetAllAccountsByTypeUserCase } from "@application/usecases/accounts/GetAllAccountsByTypeUseCase";
import { RenameAccountUseCase } from "@application/usecases/accounts/RenameAccountUseCasee";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { MoneyConverterService } from "@infrastructure/adapters/services/MoneyConverterService";
import { CurrencyRepositoryMySQL } from "../repositories/CurrencyRepositoryMySQL";

export const accountFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const accountRepository = new AccountRepositoryMySQL(client);
  const transactionRepository = new TransactionRepositoryMySQL(client);
  const configRepository = new SavingsRateRepositoryMySQL(client);
  const creditRepo = new CreditRepositoryMySQL(client);
  const currencyRepo = new CurrencyRepositoryMySQL(client);

  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  const emailService = new NodeEmailService();
  const moneyService = new MoneyConverterService(currencyRepo);

  const applyDailyInterest = new ApplyDailyInterestUseCase(
    accountRepository,
    configRepository,
    transactionRepository,
    clockService,
    uuidService
  );
  const createAccount = new CreateAccountUseCase(
    accountRepository,
    emailService,
    userRepository,
    clockService
  );
  const deleteAccount = new DeleteAccountUseCase(
    accountRepository,
    transactionRepository,
    emailService,
    userRepository,
    moneyService,
    clockService,
    uuidService,
    creditRepo
  );
  const getAccountByIBAN = new GetAccountByIBANUseCase(
    accountRepository,
    userRepository
  );
  const getAccounts = new GetAccountsUseCase(accountRepository, userRepository);
  const getAccountsByType = new GetAllAccountsByTypeUserCase(
    accountRepository,
    userRepository
  );
  const renameAccount = new RenameAccountUseCase(
    accountRepository,
    emailService,
    clockService,
    userRepository
  );
  const transfertBetweenAccount = new TransfertBetweenAccountUseCase(
    accountRepository,
    transactionRepository,
    clockService,
    uuidService,
    userRepository,
    moneyService
  );

  return {
    admin: {
      applyDailyInterest,
    },
    createAccount,
    deleteAccount,
    getAccountByIBAN,
    getAccounts,
    getAccountsByType,
    renameAccount,
    transfertBetweenAccount,
  };
};
