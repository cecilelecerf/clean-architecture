import { MySQLClient } from "../../MySQLClient";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { CreditScheduleUsecase } from "@application/usecases/credits/CreditScheduleUsecase";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { RequestCreditUsecase } from "@application/usecases/credits/RequestCreditUsecase";
import { GrantCreditUsecase } from "@application/usecases/credits/admin/GrantCreditUsecase";
import { GetCreditsByClientUsecase } from "@application/usecases/credits/GetCreditsByClientUsecase";
import { FormuleCreditRepositoryMySQL } from "../repositories/FormuleCreditRepositoryMySQL";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { GetCreditUsecase } from "@application/usecases/credits/GetCreditUsecase";
import { GetCreditByAccountUseCase } from "@application/usecases/credits/GetCreditByAccountUseCase";
import { GetAllByStatusUseCase } from "@application/usecases/credits/admin/GetAllByStatusUseCase";
import { GetAllByFormuleUsecase } from "@application/usecases/credits/GetAllByFormuleIdUsecase";
import { ApplyMonthlyCreditsPaymentUsecase } from "@application/usecases/credits/ApplyMonthlyCreditsPaymentUsecase";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { CurrencyRepositoryMySQL } from "../repositories/CurrencyRepositoryMySQL";
import { MoneyConverterService } from "@infrastructure/adapters/services/MoneyConverterService";

export const creditFactory = () => {
  const client = new MySQLClient();
  const creditRepository = new CreditRepositoryMySQL(client);
  const userRepository = new UserRepositoryMySQL(client);
  const formuleRepository = new FormuleCreditRepositoryMySQL(client);
  const accountRepository = new AccountRepositoryMySQL(client);
  const transactionRepository = new TransactionRepositoryMySQL(client);
  const currencyRepo = new CurrencyRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  const emailService = new NodeEmailService();
  const moneyConvertor = new MoneyConverterService(currencyRepo);

  const getCreditsByUser = new GetCreditsByClientUsecase(
    creditRepository,
    userRepository
  );

  const getCredit = new GetCreditUsecase(creditRepository, userRepository);

  const getCreditsByAccount = new GetCreditByAccountUseCase(
    creditRepository,
    userRepository,
    accountRepository
  );

  const creditSchedule = new CreditScheduleUsecase(
    creditRepository,
    userRepository,
    formuleRepository
  );

  const requestCredit = new RequestCreditUsecase(
    creditRepository,
    userRepository,
    accountRepository,
    formuleRepository,
    uuidService,
    clockService
  );

  const applyMonthlyPaiementCredit = new ApplyMonthlyCreditsPaymentUsecase(
    creditRepository,
    formuleRepository,
    userRepository,
    emailService,
    accountRepository,
    clockService,
    uuidService,
    transactionRepository,
    moneyConvertor
  );

  const grantCredit = new GrantCreditUsecase(
    creditRepository,
    userRepository,
    clockService
  );
  const getAllByStatus = new GetAllByStatusUseCase(
    creditRepository,
    userRepository
  );

  const getAllByFormule = new GetAllByFormuleUsecase(
    creditRepository,
    userRepository,
    formuleRepository
  );

  return {
    grantCredit,
    getCreditsByUser,
    requestCredit,
    creditSchedule,
    applyMonthlyPaiementCredit,
    getCredit,
    getCreditsByAccount,
    getAllByStatus,
    getAllByFormule,
  };
};
