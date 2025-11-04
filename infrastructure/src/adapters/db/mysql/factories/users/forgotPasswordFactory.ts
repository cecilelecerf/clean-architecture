import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { ForgotPasswordUsecase } from "@application/usecases/users/ForgotPasswordUsecase";
import { NodeEmailService } from "@infrastructure/adapters/services/NodeEmailService";

export const forgotPasswordFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const tokenService = new JwtTokenService();
  const emailService = new NodeEmailService();
  return new ForgotPasswordUsecase(userRepository, emailService, tokenService);
};
