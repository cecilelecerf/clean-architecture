import { GetAllTransactionsByAccountUsecase } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";
import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { TransactionRepositoryMongo } from "../repositories/TransactionRepositoryMongo";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

export const transactionFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const transactionRepository = new TransactionRepositoryMongo(client);
  const accountRepository = new AccountRepositoryMongo(client);
  const clockService = new SystemClockService();

  const getAllByAccount = new GetAllTransactionsByAccountUsecase(
    userRepository,
    transactionRepository,
    accountRepository,
    clockService
  );

  return {
    getAllByAccount,
  };
};
