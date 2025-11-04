import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { ConfirmRegistrationUsecase } from "@application/usecases/users/ConfirmRegistrationUsecase";

export const confirmRegistrationFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const tokenService = new JwtTokenService();
  const clockService = new SystemClockService();
  return new ConfirmRegistrationUsecase(
    userRepository,
    clockService,
    tokenService
  );
};
