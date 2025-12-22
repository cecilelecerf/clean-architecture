import { GetAllTransactionsByAccountUsecase } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";
import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { TransactionRepositoryMongo } from "../repositories/TransactionRepositoryMongo";


export const transactionFactory = () => {
    const client = new MongoClient();
    const userRepository = new UserRepositoryMongo(client);
    const transactionRepository = new TransactionRepositoryMongo(client);

    const getAllByAccount = new GetAllTransactionsByAccountUsecase(
        userRepository,
        transactionRepository
    )

    return {
        getAllByAccount
    }
}