import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { SendMessage } from "@application/usecases/messages/SendMessage";
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MessageRepositoryMySQL } from "../repositories/MessageRepositoryMySQL";
import { GetThreadMessages } from "@application/usecases/messages/GetThreadWithUserMessages";
import { MarkMessagesAsReadUpTo } from "@application/usecases/messages/MarkMessagesAsReadUpTo";

export const messagesFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const messageRepository = new MessageRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const send = new SendMessage(
    userRepository,
    threadRepository,
    messageRepository,
    uuidService,
    clockService,
  );
  const getAllByThread = new GetThreadMessages(
    userRepository,
    threadRepository,
    messageRepository,
  );
  const read = new MarkMessagesAsReadUpTo(
    messageRepository,
    clockService,
    threadRepository,
  );
  return { send, getAllByThread, read };
};
