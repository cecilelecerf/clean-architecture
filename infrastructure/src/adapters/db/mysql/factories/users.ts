import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { RegisterUsecase } from "@application/usecases/users/RegisterUsecase";
import { LoginUsecase } from "@application/usecases/users/LoginUsecase";
import { GetMeUsecase } from "@application/usecases/users/GetMeUsecase";
import { ForgotPasswordUsecase } from "@application/usecases/users/ForgotPasswordUsecase";
import { ConfirmRegistrationUsecase } from "@application/usecases/users/ConfirmRegistrationUsecase";
import { GetUsersByRoleUseCase } from "@application/usecases/users/GetUsersByRoleUseCase";
import { GetUserUsercase } from "@application/usecases/users/GetUserUsercase";
import { ResetPasswordUsecase } from "@application/usecases/users/ResetPasswordUsecase";
import { RegisterAdminUsecase } from "@application/usecases/users/RegisterAdminUsecase";
import { NodePasswordGenerateService } from "@infrastructure/adapters/services/NodePasswordGenerateService";
import { BanUserUsecase } from "@application/usecases/users/BanUserUsecase";
import { UnbanUserUsecase } from "@application/usecases/users/UnBanUserUsecase";
import { UpdateUserUsecase } from "@application/usecases/users/UpdateUserUsecase";
import { UserStatisticsUsecase } from "@application/usecases/users/UserStatisticsUsecase";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { ThreadRepositoryMySQL } from "../repositories/ThreadRepositoryMySQL";

export const usersFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const creditRepository = new CreditRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const encryptionService = new BcryptEncryptionService();
  const tokenService = new JwtTokenService();
  const uuidSerivce = new NodeUuidService();
  const emailService = new NodeEmailService();
  const clockService = new SystemClockService();
  const passwordGenerateService = new NodePasswordGenerateService();

  const register = new RegisterUsecase(
    userRepository,
    encryptionService,
    uuidSerivce,
    clockService,
    emailService,
    tokenService
  );
  const resetPassword = new ResetPasswordUsecase(
    userRepository,
    tokenService,
    encryptionService,
    clockService
  );
  const login = new LoginUsecase(
    userRepository,
    encryptionService,
    tokenService
  );
  const getMe = new GetMeUsecase(userRepository);
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
  const banUser = new BanUserUsecase(userRepository, clockService);
  const getUsersByRole = new GetUsersByRoleUseCase(userRepository);
  const getUser = new GetUserUsercase(userRepository);
  const createUser = new RegisterAdminUsecase(
    userRepository,
    encryptionService,
    uuidSerivce,
    clockService,
    emailService,
    tokenService,
    passwordGenerateService
  );
  const unbanUser = new UnbanUserUsecase(userRepository, clockService);
  const updateUser = new UpdateUserUsecase(userRepository, clockService);
  const stats = new UserStatisticsUsecase(
    userRepository,
    creditRepository,
    threadRepository
  );

  return {
    register,
    login,
    getUser,
    getMe,
    forgotPassword,
    resetPassword,
    confirmRegistration,
    banUser,
    getUsersByRole,
    createUser,
    unbanUser,
    updateUser,
    stats,
  };
};
