import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserDTO, UserEntity } from "@domain/entities/UserEntity";

export type ThreadEntityWithUsers = ThreadEntity & {
  administrator: UserDTO;
  participants: UserDTO[];
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
  findAllWithUserByAdministratorId(
    administratorId: UserEntity["id"]
  ): Promise<ThreadEntityWithUsers[]>;
  findAllWithUserByAdministratorNullable(): Promise<ThreadEntityWithUsers[]>;
  findALLExternalThreadWithUserByUserId(
    participantId: UserEntity["id"]
  ): Promise<ThreadEntityWithUsers[]>;
}
