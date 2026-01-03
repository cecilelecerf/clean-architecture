import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MySQLClient } from "../../MySQLClient";
import { FormuleCreditRepositoryMySQL } from "../repositories/FormuleCreditRepositoryMySQL";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { CreateFormuleCreditUseCase } from "@application/usecases/formules-credit/CreateFormuleCreditUseCase";
import { ActivationFormuleCreditUseCase } from "@application/usecases/formules-credit/ActivationFormuleCreditUseCase";
import { UpdateFormuleCreditUseCase } from "@application/usecases/formules-credit/UpdateFormuleCreditUseCase";
import { GetAllFormulesUsecase } from "@application/usecases/formules-credit/GetAllFormulesUseCase";
import { GetFormuleUsecase } from "@application/usecases/formules-credit/GetFormuleUseCase";
import { GetAllActiveFormulesUsecase } from "@application/usecases/formules-credit/GetAllActiveFormulesUseCase";
import { GetFormuleCreditTypesUseCase } from "@application/usecases/formules-credit/GetFormuleCreditTypesUseCase";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";

export const formuleFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const formuleRepository = new FormuleCreditRepositoryMySQL(client);
  const accountRepository = new AccountRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const createFormule = new CreateFormuleCreditUseCase(
    formuleRepository,
    userRepository,
    accountRepository,
    uuidService,
    clockService
  );

  const activateFormule = new ActivationFormuleCreditUseCase(
    formuleRepository,
    userRepository,
    clockService
  );

  const updateFormule = new UpdateFormuleCreditUseCase(
    formuleRepository,
    userRepository,
    accountRepository,
    clockService
  );

  const getAll = new GetAllFormulesUsecase(formuleRepository, userRepository);

  const getAllActive = new GetAllActiveFormulesUsecase(
    formuleRepository,
    userRepository
  );

  const getFormule = new GetFormuleUsecase(formuleRepository, userRepository);

  const getTypes = new GetFormuleCreditTypesUseCase(userRepository);

  return {
    createFormule,
    activateFormule,
    updateFormule,
    getAll,
    getAllActive,
    getFormule,
    getTypes,
  };
};
