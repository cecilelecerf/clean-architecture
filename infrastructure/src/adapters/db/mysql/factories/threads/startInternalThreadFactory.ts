import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { ThreadRepositoryMySQL } from "../../repositories/ThreadRepositoryMySQL";
import { StartInternalThreadUsecase } from "@application/usecases/threads/StartInternalThreadUsecase";

export const startInternalThreadFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const uuidSerivce = new NodeUuidService();
  const clockService = new SystemClockService();
  return new StartInternalThreadUsecase(
    threadRepository,
    userRepository,
    uuidSerivce,
    clockService
  );
};
