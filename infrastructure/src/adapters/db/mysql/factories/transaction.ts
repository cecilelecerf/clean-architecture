import { GetAllTransactionsByAccountUsecase } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";
import { MySQLClient } from "../../MySQLClient";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";

export const transactionFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const transactionRepository = new TransactionRepositoryMySQL(client);
  const accountRepository = new AccountRepositoryMySQL(client);

  const getAllByAccount = new GetAllTransactionsByAccountUsecase(
    userRepository,
    transactionRepository,
    accountRepository
  );

  return {
    getAllByAccount,
  };
};
