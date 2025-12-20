import { ThreadEntityWithUsers } from "@application/ports/repositories/ThreadRepository";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserToFront } from "@domain/entities/UserEntity";

export type ThreadEntityWithUsersDTO = ThreadEntity & {
  administrator: UserToFront | null;
  participants: UserToFront[];
};

export class ThreadDTOMapper {
  static map(thread: ThreadEntityWithUsers): ThreadEntityWithUsersDTO {
    return Object.assign(thread, {
      administrator: thread.administrator
        ? thread.administrator.toFront()
        : null,
      participants: thread.participants.map((p) => p.toFront()),
    });
  }
  static maps(threads: ThreadEntityWithUsers[]): ThreadEntityWithUsersDTO[] {
    return threads.map((thread) => this.map(thread));
  }
}
