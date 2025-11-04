import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { ThreadRepositoryMySQL } from "../../repositories/ThreadRepositoryMySQL";
import { AddParticipantUsecase } from "@application/usecases/threads/AddParticipantUsecase";

export const addParticipantFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const clockService = new SystemClockService();
  return new AddParticipantUsecase(
    userRepository,
    threadRepository,
    clockService
  );
};
