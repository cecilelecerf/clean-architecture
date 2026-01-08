import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { LoginUsecase } from "@application/usecases/users/LoginUsecase";
import { GetMeUsecase } from "@application/usecases/users/GetMeUsecase";
import { ForgotPasswordUsecase } from "@application/usecases/users/ForgotPasswordUsecase";
import { ConfirmRegistrationUsecase } from "@application/usecases/users/ConfirmRegistrationUsecase";
import { GetUsersByRoleUseCase } from "@application/usecases/users/GetUsersByRoleUseCase";
import { GetUserUsercase } from "@application/usecases/users/GetUserUsercase";
import { RegisterUsecase } from "@application/usecases/users/RegisterUsecase";
import { BanUserUsecase } from "@application/usecases/users/BanUserUsecase";
import { RegisterAdminUsecase } from "@application/usecases/users/RegisterAdminUsecase";
import { UnbanUserUsecase } from "@application/usecases/users/UnBanUserUsecase";
import { UpdateUserUsecase } from "@application/usecases/users/UpdateUserUsecase";
import { UserStatisticsUsecase } from "@application/usecases/users/UserStatisticsUsecase";
import { NodePasswordGenerateService } from "@infrastructure/adapters/services/NodePasswordGenerateService";
import { ResetPasswordUsecase } from "@application/usecases/users/ResetPasswordUsecase";
import { CreditRepositoryMongo } from "../repositories/CreditRepositoryMongo";
import { ThreadRepositoryMongo } from "../repositories/ThreadRepositoryMongo";

export const usersFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const creditRepository = new CreditRepositoryMongo(client);
  const threadRepository = new ThreadRepositoryMongo(client);
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
