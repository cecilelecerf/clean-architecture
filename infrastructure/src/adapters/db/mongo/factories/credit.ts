import { CreditScheduleUsecase } from "@application/usecases/credits/CreditScheduleUsecase";
import { ApplyMonthlyCreditPaiementUsecase } from "@application/usecases/credits/ApplyMonthlyCreditPaiementUsecase";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { RequestCreditUsecase } from "@application/usecases/credits/RequestCreditUsecase";
import { GrantCreditUsecase } from "@application/usecases/credits/admin/GrantCreditUsecase";
import { CreditRepositoryMongo } from "../repositories/CreditRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { MongoClient } from "../../MongoClient";
import { GetCreditsByClientUsecase } from "@application/usecases/credits/GetCreditsByClientUsecase";
import { FormuleCreditRepositoryMongo } from "../repositories/FormuleCreditRepositoryMongo";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { GetCreditUsecase } from "@application/usecases/credits/GetCreditUsecase";
import { GetCreditByAccountUseCase } from "@application/usecases/credits/GetCreditByAccountUseCase";
import { GetPendingCreditsUseCase } from "@application/usecases/credits/admin/GetPendingCreditsUseCase";
import { GetCreditsWithDetailsUseCase } from "@application/usecases/credits/admin/GetCreditsWithDetailUseCase";
import { GetActiveCreditsUseCase } from "@application/usecases/credits/admin/GetActiveCreditsUseCase";

export const creditFactory = () => {
  const client = new MongoClient();
  const creditRepository = new CreditRepositoryMongo(client);
  const userRepository = new UserRepositoryMongo(client);
  const formuleRepository = new FormuleCreditRepositoryMongo(client);
  const accountRepository = new AccountRepositoryMongo(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const getCreditsByUser = new GetCreditsByClientUsecase(
    creditRepository,
    userRepository,
    accountRepository
  );

  const getCredit = new GetCreditUsecase(creditRepository, userRepository);

  const getCreditsByAccount = new GetCreditByAccountUseCase(
    creditRepository,
    userRepository,
    accountRepository
  )

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

  const applyMonthlyPaiementCredit = new ApplyMonthlyCreditPaiementUsecase(
    creditRepository,
    userRepository,
    formuleRepository
  );

  const getPending = new GetPendingCreditsUseCase(
    creditRepository,
    userRepository,
  );

  const getActive = new GetActiveCreditsUseCase(
    creditRepository,
    userRepository,
    clockService
  );

  const grantCredit = new GrantCreditUsecase(
    creditRepository,
    userRepository,
    clockService
  );

  const getOneWithDetails = new GetCreditsWithDetailsUseCase(
    creditRepository,
    userRepository,
  )

  return {
    grantCredit,
    getCreditsByUser,
    requestCredit,
    creditSchedule,
    applyMonthlyPaiementCredit,
    getCredit,
    getCreditsByAccount,
    getPending,
    getActive,
    getOneWithDetails
  };
};
