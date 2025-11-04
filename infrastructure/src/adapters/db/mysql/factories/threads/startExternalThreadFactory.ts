import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import { StartExternalThreadUsecase } from "@application/usecases/threads/StartExternalThreadUsecase";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MessageRepositoryMySQL } from "../../repositories/MessageRepositoryMySQL";

export const startExternalThreadFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const messageRepository = new MessageRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  return new StartExternalThreadUsecase(
    threadRepository,
    userRepository,
    messageRepository,
    uuidService,
    clockService
  );
};
