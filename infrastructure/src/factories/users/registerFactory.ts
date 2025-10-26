import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { RegisterUsecase } from "@application/usecases/users/RegisterUsecase";

export const registerFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const encryptionService = new BcryptEncryptionService();
  const tokenService = new JwtTokenService();
  const uuidSerivce = new NodeUuidService();
  const emailService = new NodeEmailService();
  const clockService = new SystemClockService();
  return new RegisterUsecase(
    userRepository,
    encryptionService,
    uuidSerivce,
    clockService,
    emailService,
    tokenService
  );
};
