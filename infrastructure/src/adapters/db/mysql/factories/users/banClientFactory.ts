import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { BanClientUsecase } from "@application/usecases/users/BanClientUsecase";

export const banClientFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const clockService = new SystemClockService();
  return new BanClientUsecase(userRepository, clockService);
};
