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
  findWithUserById(
    id: ThreadEntity["id"]
  ): Promise<ThreadEntityWithUsers | null>;
  findAllByParticipantId(userId: UserEntity["id"]): Promise<ThreadEntity[]>;
  findAllByAdministratorId(
    administratorId: UserEntity["id"]
  ): Promise<ThreadEntity[]>;
  findOpenThreadsWithUserByParticipantId(
    participantId: UserEntity["id"]
  ): Promise<ThreadEntityWithUsers[]>;
}
