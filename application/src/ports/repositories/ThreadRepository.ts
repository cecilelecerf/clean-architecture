import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserDTO, UserEntity } from "@domain/entities/UserEntity";

export type ThreadEntityWithUsers = ThreadEntity & {
<<<<<<< HEAD
  administrator: UserDTO | null;
=======
  administrator: UserDTO;
>>>>>>> 2ce9cab (thread)
  participants: UserDTO[];
};

export interface ThreadRepository {
  save(thread: ThreadEntity): Promise<void>;
  update(thread: ThreadEntity): Promise<void>;
  delete(id: ThreadEntity["id"]): Promise<void>;
  findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null>;
<<<<<<< HEAD
=======
  findWithUserById(
    id: ThreadEntity["id"]
  ): Promise<ThreadEntityWithUsers | null>;
>>>>>>> 2ce9cab (thread)
  findAllByParticipantId(userId: UserEntity["id"]): Promise<ThreadEntity[]>;
  findAllByAdministratorId(
    administratorId: UserEntity["id"]
  ): Promise<ThreadEntity[]>;
<<<<<<< HEAD

  // With user
  findWithUserById(
    id: ThreadEntity["id"]
  ): Promise<ThreadEntityWithUsers | null>;
  findAllWithUserByAdministratorId(
    administratorId: UserEntity["id"]
  ): Promise<ThreadEntityWithUsers[]>;
  findAllWithUserByAdministratorNullable(): Promise<ThreadEntityWithUsers[]>;
  findAllExternalThreadWithUserByUserId(
=======
  findOpenThreadsWithUserByParticipantId(
>>>>>>> 2ce9cab (thread)
    participantId: UserEntity["id"]
  ): Promise<ThreadEntityWithUsers[]>;
}
