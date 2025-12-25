import { ThreadEntityWithUsers } from "@application/ports/repositories/ThreadRepository";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserToDTO } from "@domain/entities/UserEntity";

export type ThreadEntityWithUsersDTO = ThreadEntity & {
  administrator: UserToDTO | null;
  participants: UserToDTO[];
};

export class ThreadDTOMapper {
  static map(thread: ThreadEntityWithUsers): ThreadEntityWithUsersDTO {
    return Object.assign(thread, {
      administrator: thread.administrator ? thread.administrator.toDTO() : null,
      participants: thread.participants.map((p) => p.toDTO()),
    });
  }
  static maps(threads: ThreadEntityWithUsers[]): ThreadEntityWithUsersDTO[] {
    return threads.map((thread) => this.map(thread));
  }
}
