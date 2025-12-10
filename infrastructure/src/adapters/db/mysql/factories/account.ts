import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";

import { RenameAccountUsecase } from "@application/usecases/accounts/RenameAccountUsecase";
import { CreateAccountUsecase } from "@application/usecases/accounts/CreateAccountUsecase";
import { DeleteAccountUsecase } from "@application/usecases/accounts/DeleteAccountUsecase";
import { TransfertBetweenAccountUsecase } from "@application/usecases/accounts/TransfertBetweenAccountUsecase";
import { ApplyDailyInterestUseCase } from "@application/usecases/accounts/ApplyDailyInterestUseCase";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";

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
        clockService,
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
        uuidService
    );

    return {
        admin: {
            applyDailyInterest
        },
        client: {
            createAccount,
            deleteAccount,
            renameAccount,
            transfertBetweenAccount
        },
    };
}