import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface ThreadRepository {
  saveThread(thread: ThreadEntity): Promise<void>;
  findThreadById(id: ThreadEntity["id"]): Promise<ThreadEntity>;
  findThreadsByUserId(userId: UserEntity["id"]): Promise<ThreadEntity[]>;
  findThreadsByAdvisorId(advisorId: UserEntity["id"]): Promise<ThreadEntity[]>;
  transferThread(
    advisorId: UserEntity["id"],
    thread: ThreadEntity
  ): Promise<void>;
}
