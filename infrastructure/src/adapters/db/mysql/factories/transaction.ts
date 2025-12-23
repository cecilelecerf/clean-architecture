import { GetAllTransactionsByAccountUsecase } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";
import { MySQLClient } from "../../MySQLClient";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { GetTransactionByIdUseCase } from "@application/usecases/transactions/GetTransactionByIdUsecase";

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
  const getById = new GetTransactionByIdUseCase(
    userRepository,
    transactionRepository
  );

  return {
    getAllByAccount,
    getById,
  };
};
