import { ThreadEntity } from "@domain/entities/ThreadEntity";

export interface ThreadRepository {
  saveThread(thread: ThreadEntity): Promise<void>;
  findThreadById(id: string): Promise<ThreadEntity>;
  findThreadsByUserId(userId: string): Promise<ThreadEntity[]>;
  findThreadsByAdvisorId(advisorId: string): Promise<ThreadEntity[]>;
  transferThread(advisorId: string, thread: ThreadEntity): Promise<void>;
}