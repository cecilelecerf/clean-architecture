import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserDTO } from "@domain/entities/UserEntity";
<<<<<<< HEAD
export type MessageWithUser = MessageEntity & { sender: UserDTO };
=======
export type MessageWithUser = MessageEntity & { user: UserDTO };
>>>>>>> 2ce9cab (thread)
export interface MessageRepository {
  save(message: MessageEntity): Promise<void>;
  update(message: MessageEntity): Promise<void>;
  delete(messageId: MessageEntity["id"]): Promise<void>;
  findAllByThread(id: ThreadEntity["id"]): Promise<MessageEntity[]>;
  findAllWithUserByThread(id: ThreadEntity["id"]): Promise<MessageWithUser[]>;
}
