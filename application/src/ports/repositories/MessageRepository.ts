import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
export type MessageWithUser = MessageEntity & {
  sender: UserEntity;
  readByUsers: { user: UserEntity; readAt: Date }[];
};
export interface MessageRepository {
  save(message: MessageEntity): Promise<void>;
  findAllWithUserByThread(id: ThreadEntity["id"]): Promise<MessageWithUser[]>;
  findById(id: MessageEntity["id"]): Promise<MessageEntity | null>;
  findUnreadUpTo(
    threadId: ThreadEntity["id"],
    userId: UserEntity["id"],
    sentAt: Date,
  ): Promise<MessageEntity[]>;
  updateMany(messages: MessageEntity[], now: Date): Promise<void | Error>;
}
