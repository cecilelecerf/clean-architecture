import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";

export interface MessageRepository {
  save(message: MessageEntity): Promise<void>;
  findAllByThread(id: ThreadEntity["id"]): Promise<MessageEntity[]>;
}
