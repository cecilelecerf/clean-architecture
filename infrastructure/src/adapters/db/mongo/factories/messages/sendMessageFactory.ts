import { MongoClient } from "@infrastructure/adapters/db/MongoClient";
import { UserRepositoryMongo } from "../../repositories/UserRepositoryMongo";
import { ThreadRepositoryMongo } from "../../repositories/ThreadRepositoryMongo";
import { MessageRepositoryMongo } from "../../repositories/MessageRepositoryMongo";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { SendMessage } from "@application/usecases/messages/SendMessage";

export const sendMessageFactory = () => {
    const client = new MongoClient();
    const userRepository = new UserRepositoryMongo(client);
    const threadRepository = new ThreadRepositoryMongo(client);
    const messageRepository = new MessageRepositoryMongo(client);
    const uuidService = new NodeUuidService();
    const clockService = new SystemClockService();
    return new SendMessage(
        userRepository,
        threadRepository,
        messageRepository,
        uuidService,
        clockService
    );
}