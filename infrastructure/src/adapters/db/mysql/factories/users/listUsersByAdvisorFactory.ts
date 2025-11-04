import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ListUsersByAdvisorUseCase } from "@application/usecases/users/ListUsersByAdvisorUseCase";

export const listUsersByAdvisorFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  return new ListUsersByAdvisorUseCase(userRepository);
};
