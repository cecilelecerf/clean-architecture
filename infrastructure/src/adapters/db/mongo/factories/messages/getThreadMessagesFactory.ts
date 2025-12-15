import { MongoClient } from "@infrastructure/adapters/db/MongoClient";
import { UserRepositoryMongo } from "../../repositories/UserRepositoryMongo";
import { ThreadRepositoryMongo } from "../../repositories/ThreadRepositoryMongo";
import { MessageRepositoryMongo } from "../../repositories/MessageRepositoryMongo";
import { GetThreadMessages } from "@application/usecases/messages/GetThreadWithUserMessages";

export const getThreadMessagesFactory = () => {
    const client = new MongoClient();
    const userRepository = new UserRepositoryMongo(client);
    const threadRepository = new ThreadRepositoryMongo(client);
    const messageRepository = new MessageRepositoryMongo(client);
    return new GetThreadMessages(
        userRepository,
        threadRepository,
        messageRepository
    );
}