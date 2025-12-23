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

export const creditFactory = () => {
  const client = new MongoClient();
  const creditRepository = new CreditRepositoryMongo(client);
  const userRepository = new UserRepositoryMongo(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const listClientCredits = new GetCreditsByClientUsecase(
    creditRepository,
    userRepository
  );

  const creditSchedule = new CreditScheduleUsecase(
    creditRepository,
    userRepository
  );

  const requestCredit = new RequestCreditUsecase(
    creditRepository,
    userRepository,
    uuidService,
    clockService
  );

  const applyMonthlyPaiementCredit = new ApplyMonthlyCreditPaiementUsecase(
    creditRepository,
    userRepository
  );

  const grantCredit = new GrantCreditUsecase(
    creditRepository,
    userRepository,
    clockService
  );

  return {
    admin: {
      grantCredit,
    },
    client: {
      listClientCredits,
      creditSchedule,
      requestCredit,
      applyMonthlyPaiementCredit,
    },
  };
};
