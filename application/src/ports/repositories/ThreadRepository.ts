import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserToFront, UserEntity } from "@domain/entities/UserEntity";

export type ThreadEntityWithUsers = ThreadEntity & {
  administrator: UserToFront | null;
  participants: UserToFront[];
};

export interface ThreadRepository {
  save(thread: ThreadEntity): Promise<void>;
  update(thread: ThreadEntity): Promise<void>;
  delete(id: ThreadEntity["id"]): Promise<void>;
  findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null>;
  findAllByParticipantId(userId: UserEntity["id"]): Promise<ThreadEntity[]>;
  findAllByAdministratorId(
    administratorId: UserEntity["id"]
  ): Promise<ThreadEntity[]>;

  // With user
  findWithUserById(
    id: ThreadEntity["id"]
  ): Promise<ThreadEntityWithUsers | null>;
  findAllWithUserByAdministratorIdAndType(
    administratorId: UserEntity["id"],
    type?: ThreadEntity["type"]
  ): Promise<ThreadEntityWithUsers[]>;
  findAllWithUserByAdministratorNullable(): Promise<ThreadEntityWithUsers[]>;
  findAllWithUserByParticipantIdAndType(
    participantId: UserEntity["id"],
    type?: ThreadEntity["type"]
  ): Promise<ThreadEntityWithUsers[]>;
}
