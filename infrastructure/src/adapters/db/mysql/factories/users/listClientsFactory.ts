import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ListClientsUsecase } from "@application/usecases/users/ListClientsUsecase";

export const listClientsFactory = () => {
  const client = new MySQLClient();

  const userRepository = new UserRepositoryMySQL(client);
  return new ListClientsUsecase(userRepository);
};
