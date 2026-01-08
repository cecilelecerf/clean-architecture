import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
export type MessageWithUser = MessageEntity & { sender: UserEntity };
export interface MessageRepository {
  save(message: MessageEntity): Promise<void>;
  update(message: MessageEntity): Promise<void>;
  delete(messageId: MessageEntity["id"]): Promise<void>;
  findAllByThread(id: ThreadEntity["id"]): Promise<MessageEntity[]>;
  findAllWithUserByThread(id: ThreadEntity["id"]): Promise<MessageWithUser[]>;
}
