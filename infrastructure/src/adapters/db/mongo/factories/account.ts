import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { SavingsRateRepositoryMongo } from "../repositories/SavingsRateRepositoryMongo";
import { TransactionRepositoryMongo } from "../repositories/TransactionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { ApplyDailyInterestUseCase } from "@application/usecases/accounts/ApplyDailyInterestUseCase";
import { CreateAccountUseCase } from "@application/usecases/accounts/CreateAccountUsecase";
import { DeleteAccountUseCase } from "@application/usecases/accounts/DeleteAccountUsecase";
import { GetAccountByIBANUseCase } from "@application/usecases/accounts/GetAccountByIBANUseCase";
import { GetAccountsUseCase } from "@application/usecases/accounts/GetAccountsUseCase";
import { RenameAccountUseCase } from "@application/usecases/accounts/RenameAccountUsecase";
import { TransfertBetweenAccountUseCase } from "@application/usecases/accounts/TransfertBetweenAccountUsecase";
import { GetAllAccountsByTypeUserCase } from "@application/usecases/accounts/GetAllAccountsByTypeUseCase";


export const accountFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const accountRepository = new AccountRepositoryMongo(client);
  const transactionRepository = new TransactionRepositoryMongo(client);
  const configRepository = new SavingsRateRepositoryMongo(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  const emailService = new NodeEmailService();

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
    emailService,
    userRepository
  );
  const getAccountByIBAN = new GetAccountByIBANUseCase(
    accountRepository,
    userRepository
  );
  const getAccounts = new GetAccountsUseCase(
    accountRepository,
    userRepository
  );
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
    userRepository
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
