import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { MessageEntity } from "domain/entities/MessageEntity";

export type ThreadEntityWithUsers = ThreadEntity & {
  administrator: UserEntity | null;
  participants: UserEntity[];
};
export type ThreadEntityWithUsersAndLastMessage = ThreadEntity & {
  administrator: UserEntity | null;
  participants: UserEntity[];
  lastMessage: MessageEntity | null;
};

export interface ThreadRepository {
  save(thread: ThreadEntity): Promise<void>;
  update(thread: ThreadEntity): Promise<void>;
  findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null>;
  countByAdvisor(advisorId: UserEntity["id"]): Promise<number>;

  // With user
  findWithUserById(
    id: ThreadEntity["id"],
  ): Promise<ThreadEntityWithUsers | null>;
  findAllWithUserAndLastMessageByAdministratorIdAndType(
    administratorId: UserEntity["id"],
    type?: ThreadEntity["type"],
  ): Promise<ThreadEntityWithUsersAndLastMessage[]>;
  findAllWithUserAndLastMessageByAdministratorNullable(): Promise<
    ThreadEntityWithUsersAndLastMessage[]
  >;
  findAllWithUserAndLastMessageByParticipantIdAndType(
    participantId: UserEntity["id"],
    type?: ThreadEntity["type"],
  ): Promise<ThreadEntityWithUsersAndLastMessage[]>;
}
