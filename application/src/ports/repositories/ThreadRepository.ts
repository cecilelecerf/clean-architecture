import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export type ThreadEntityWithUsers = ThreadEntity & {
  administrator: UserEntity | null;
  participants: UserEntity[];
};

export interface ThreadRepository {
  save(thread: ThreadEntity): Promise<void>;
  update(thread: ThreadEntity): Promise<void>;
  findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null>;
  countByAdvisor(advisorId: UserEntity["id"]): Promise<number>;

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
