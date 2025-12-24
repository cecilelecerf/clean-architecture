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
import { BanClientUsecase } from "@application/usecases/users/BanClientUsecase";
import { GetUsersByRoleUseCase } from "@application/usecases/users/GetUsersByRoleUseCase";
import { GetUserUsercase } from "@application/usecases/users/GetUserUsercase";
import { RegisterUsecase } from "@application/usecases/users/RegisterUsecase";

export const usersFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
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
  const banClient = new BanClientUsecase(userRepository, clockService);
  const getUsersByRole = new GetUsersByRoleUseCase(userRepository);
  const getUser = new GetUserUsercase(userRepository);

  return {
    register,
    login,
    getUser,
    getMe,
    forgotPassword,
    confirmRegistration,
    banClient,
    getUsersByRole,
  };
};
