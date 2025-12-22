import { ClientCreditsUsecase } from "@application/usecases/credits/ListClientCreditsUsecase";
import { MySQLClient } from "../../MySQLClient";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { CreditScheduleUsecase } from "@application/usecases/credits/CreditScheduleUsecase";
import { ApplyMonthlyCreditPaiementUsecase } from "@application/usecases/credits/ApplyMonthlyCreditPaiementUsecase";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { RequestCreditUsecase } from "@application/usecases/credits/RequestCreditUsecase";
import { GrantCreditUsecase } from "@application/usecases/credits/admin/GrantCreditUsecase";

export const creditFactory = () => {
    const client = new MySQLClient();
    const creditRepository = new CreditRepositoryMySQL(client);
    const userRepository = new UserRepositoryMySQL(client);
    const uuidService = new NodeUuidService();
    const clockService = new SystemClockService();

    const listClientCredits = new ClientCreditsUsecase(
        creditRepository,
        userRepository
    )

    const creditSchedule = new CreditScheduleUsecase(
        creditRepository,
        userRepository
    )

    const requestCredit = new RequestCreditUsecase(
        creditRepository,
        userRepository,
        uuidService,
        clockService
    )

    const applyMonthlyPaiementCredit = new ApplyMonthlyCreditPaiementUsecase(
        creditRepository,
        userRepository
    )

    const grantCredit = new GrantCreditUsecase(
        creditRepository,
        userRepository
    )

    return {
        admin: {
            grantCredit
        },
        client: {
            listClientCredits,
            creditSchedule,
            requestCredit,
            applyMonthlyPaiementCredit
        }
    };
}