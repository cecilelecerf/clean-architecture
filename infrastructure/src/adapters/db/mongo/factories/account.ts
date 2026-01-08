import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { SavingsRateRepositoryMongo } from "../repositories/SavingsRateRepositoryMongo";
import { TransactionRepositoryMongo } from "../repositories/TransactionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { ApplyDailyInterestUseCase } from "@application/usecases/accounts/ApplyDailyInterestUseCase";
import { CreateAccountUseCase } from "@application/usecases/accounts/CreateAccountUseCasee";
import { DeleteAccountUseCase } from "@application/usecases/accounts/DeleteAccountUseCasee";
import { GetAccountByIBANUseCase } from "@application/usecases/accounts/GetAccountByIBANUseCase";
import { GetAccountsUseCase } from "@application/usecases/accounts/GetAccountsUseCase";
import { RenameAccountUseCase } from "@application/usecases/accounts/RenameAccountUseCasee";
import { TransfertBetweenAccountUseCase } from "@application/usecases/accounts/TransfertBetweenAccountUseCasee";
import { GetAllAccountsByTypeUserCase } from "@application/usecases/accounts/GetAllAccountsByTypeUseCase";
import { MoneyConverterService } from "@infrastructure/adapters/services/MoneyConverterService";
import { CurrencyRepositoryMongo } from "../repositories/CurrencyRepositoryMongo";
import { CreditRepositoryMongo } from "../repositories/CreditRepositoryMongo";

export const accountFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const accountRepository = new AccountRepositoryMongo(client);
  const transactionRepository = new TransactionRepositoryMongo(client);
  const configRepository = new SavingsRateRepositoryMongo(client);
  const currencyRepo = new CurrencyRepositoryMongo(client);
  const creditRepo = new CreditRepositoryMongo(client);
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
