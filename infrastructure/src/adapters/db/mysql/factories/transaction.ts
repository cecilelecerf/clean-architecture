import { GetAllTransactionsByAccountUsecase } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";
import { MySQLClient } from "../../MySQLClient";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";

export const transactionFactory = () => {
    const client = new MySQLClient();
    const userRepository = new UserRepositoryMySQL(client);
    const transactionRepository = new TransactionRepositoryMySQL(client);

    const getAllByAccount = new GetAllTransactionsByAccountUsecase(
        userRepository,
        transactionRepository
    )

    return {
        getAllByAccount
    }
}