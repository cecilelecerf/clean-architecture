import { ThreadEntityWithUsers } from "@application/ports/repositories/ThreadRepository";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserToFront } from "@domain/entities/UserEntity";

export type ThreadEntityWithUsersToFront = ThreadEntity & {
  administrator: UserToFront | null;
  participants: UserToFront[];
};

export class ThreadToFrontMapper {
  static map(thread: ThreadEntityWithUsers): ThreadEntityWithUsersToFront {
    return Object.assign(thread, {
      administrator: thread.administrator
        ? thread.administrator.toFront()
        : null,
      participants: thread.participants.map((p) => p.toFront()),
    });
  }
  static maps(
    threads: ThreadEntityWithUsers[]
  ): ThreadEntityWithUsersToFront[] {
    return threads.map((thread) => this.map(thread));
  }
}
