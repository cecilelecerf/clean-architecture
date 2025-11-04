import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { UpdateThreadTitleUsecase } from "@application/usecases/threads/UpdateThreadTitleUsecase";
import { ThreadRepositoryMySQL } from "../../repositories/ThreadRepositoryMySQL";

export const updateThreadTitleFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const clockService = new SystemClockService();
  return new UpdateThreadTitleUsecase(
    userRepository,
    threadRepository,
    clockService
  );
};
