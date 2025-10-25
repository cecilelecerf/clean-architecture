import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface ThreadRepository {
  save(thread: ThreadEntity): Promise<void>;
  update(thread: ThreadEntity): Promise<void>;
  delete(id: ThreadEntity["id"]): Promise<void>;
  findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null>;
  findAllByUserId(userId: UserEntity["id"]): Promise<ThreadEntity[]>;
  findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<ThreadEntity[]>;
}
