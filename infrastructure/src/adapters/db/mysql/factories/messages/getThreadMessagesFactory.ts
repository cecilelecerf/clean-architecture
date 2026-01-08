import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import { GetThreadMessages } from "@application/usecases/messages/GetThreadWithUserMessages";
import { MessageRepositoryMySQL } from "../../repositories/MessageRepositoryMySQL";
import { UserRepositoryMySQL } from "../../repositories/UserRepositoryMySQL";

export const getThreadMessagesFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const messageRepository = new MessageRepositoryMySQL(client);
  return new GetThreadMessages(
    userRepository,
    threadRepository,
    messageRepository
  );
};
