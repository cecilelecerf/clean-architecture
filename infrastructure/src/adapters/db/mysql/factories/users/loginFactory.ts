import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { LoginUsecase } from "@application/usecases/users/LoginUsecase";

export const loginFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const encryptionService = new BcryptEncryptionService();
  const tokenService = new JwtTokenService();

  return new LoginUsecase(userRepository, encryptionService, tokenService);
};
