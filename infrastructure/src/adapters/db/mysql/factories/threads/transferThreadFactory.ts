import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { ThreadRepositoryMySQL } from "../../repositories/ThreadRepositoryMySQL";
import { TransferThreadUsecase } from "@application/usecases/threads/TransferThreadUsecase";

export const transferThreadFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const clockService = new SystemClockService();
  return new TransferThreadUsecase(
    userRepository,
    threadRepository,
    clockService
  );
};
