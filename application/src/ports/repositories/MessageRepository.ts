import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
export type MessageWithUser = MessageEntity & { sender: UserEntity };
export interface MessageRepository {
  save(message: MessageEntity): Promise<void>;
  findAllWithUserByThread(id: ThreadEntity["id"]): Promise<MessageWithUser[]>;
}
