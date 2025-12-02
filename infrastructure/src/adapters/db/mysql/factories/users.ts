import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { RegisterUsecase } from "@application/usecases/users/RegisterUsecase";
import { LogoutUsecase } from "@application/usecases/users/LogoutUsecase";
import { LoginUsecase } from "@application/usecases/users/LoginUsecase";
import { GetUserUsecase } from "@application/usecases/users/GetUserUsecase";
import { ForgotPasswordUsecase } from "@application/usecases/users/ForgotPasswordUsecase";
import { ConfirmRegistrationUsecase } from "@application/usecases/users/ConfirmRegistrationUsecase";
import { BanClientUsecase } from "@application/usecases/users/BanClientUsecase";
import { ListUsersByAdvisorUseCase } from "@application/usecases/users/advisors/ListUsersByAdvisorUseCase";
import { AdvisorGetClientUsercase } from "@application/usecases/users/advisors/AdvisorGetClientUsercase";

export const usersFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const encryptionService = new BcryptEncryptionService();
  const tokenService = new JwtTokenService();
  const uuidSerivce = new NodeUuidService();
  const emailService = new NodeEmailService();
  const clockService = new SystemClockService();

  const register = new RegisterUsecase(
    userRepository,
    encryptionService,
    uuidSerivce,
    clockService,
    emailService,
    tokenService
  );
  const logout = new LogoutUsecase(tokenService);
  const login = new LoginUsecase(
    userRepository,
    encryptionService,
    tokenService
  );
  const getUser = new GetUserUsecase(userRepository);
  const forgotPassword = new ForgotPasswordUsecase(
    userRepository,
    emailService,
    tokenService
  );
  const confirmRegistration = new ConfirmRegistrationUsecase(
    userRepository,
    clockService,
    tokenService
  );
  const banClient = new BanClientUsecase(userRepository, clockService);
  const listClients = new ListUsersByAdvisorUseCase(userRepository);
  const advisorGetClient = new AdvisorGetClientUsercase(userRepository);

  return {
    register,
    logout,
    login,
    getUser,
    forgotPassword,
    confirmRegistration,
    banClient,
    listClients,
    advisorGetClient,
  };
};
