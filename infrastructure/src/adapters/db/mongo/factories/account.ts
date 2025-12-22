import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { SavingsRateRepositoryMongo } from "../repositories/SavingsRateRepositoryMongo";
import { TransactionRepositoryMongo } from "../repositories/TransactionRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { ApplyDailyInterestUseCase } from "@application/usecases/accounts/ApplyDailyInterestUseCase";
import { DeleteAccountUsecase } from "@application/usecases/accounts/DeleteAccountUsecase";
import { RenameAccountUsecase } from "@application/usecases/accounts/RenameAccountUsecase";
import { TransfertBetweenAccountUsecase } from "@application/usecases/accounts/TransfertBetweenAccountUsecase";
import { GetAccountByIBANUsercase } from "@application/usecases/accounts/GetAccountByIBANUseCase";
import { GetAccountsUsercase } from "@application/usecases/accounts/GetAccountsUseCase";
import { CreateAccountUsecase } from "@application/usecases/accounts/CreateAccountUsecasee";

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
  const createAccount = new CreateAccountUsecase(
    accountRepository,
    emailService,
    userRepository,
    clockService
  );
  const deleteAccount = new DeleteAccountUsecase(
    accountRepository,
    emailService,
    userRepository
  );
  const renameAccount = new RenameAccountUsecase(
    accountRepository,
    emailService,
    clockService,
    userRepository
  );
  const transfertBetweenAccount = new TransfertBetweenAccountUsecase(
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
    client: {
      createAccount,
      deleteAccount,
      renameAccount,
      transfertBetweenAccount,
    },
  };
};
