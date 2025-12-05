import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import { FindThreadWithUserUsecase } from "@application/usecases/threads/FindThreadWithUserUsecase";

export const findThreadWithUserFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  return new FindThreadWithUserUsecase(threadRepository, userRepository);
};
