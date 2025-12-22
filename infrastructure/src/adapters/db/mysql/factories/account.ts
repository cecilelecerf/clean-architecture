import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";

import { RenameAccountUsecase } from "@application/usecases/accounts/RenameAccountUseCasee";
import { DeleteAccountUsecase } from "@application/usecases/accounts/DeleteAccountUseCasee";
import { ApplyDailyInterestUseCase } from "@application/usecases/accounts/ApplyDailyInterestUseCase";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";
import { GetAccountByIBANUsercase } from "@application/usecases/accounts/GetAccountByIBANUseCase";
import { GetAccountsUsercase } from "@application/usecases/accounts/GetAccountsUseCase";
import { CreateAccountUsecase } from "@application/usecases/accounts/CreateAccountUseCasee";
import { TransfertBetweenAccountUsecase } from "@application/usecases/accounts/TransfertBetweenAccountUseCasee";

export const accountFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const accountRepository = new AccountRepositoryMySQL(client);
  const transactionRepository = new TransactionRepositoryMySQL(client);
  const configRepository = new SavingsRateRepositoryMySQL(client);
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
  const getAccountByIBAN = new GetAccountByIBANUsercase(
    accountRepository,
    userRepository
  );
  const getAccounts = new GetAccountsUsercase(
    accountRepository,
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

    createAccount,
    deleteAccount,
    getAccountByIBAN,
    getAccounts,
    renameAccount,
    transfertBetweenAccount,
  };
};
