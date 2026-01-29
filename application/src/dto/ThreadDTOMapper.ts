import {
  ThreadEntityWithUsers,
  ThreadEntityWithUsersAndLastMessage,
} from "@application/ports/repositories/ThreadRepository";
import { ThreadDTO } from "@domain/entities/ThreadEntity";
import { UserToDTO } from "@domain/entities/UserEntity";
import { MessageEntity } from "domain/entities/MessageEntity";

export type ThreadEntityWithUsersDTO = ThreadDTO & {
  administrator: UserToDTO | null;
  participants: UserToDTO[];
};
export type ThreadEntityWithUsersLastMessageDTO = ThreadDTO & {
  administrator: UserToDTO | null;
  participants: UserToDTO[];
  lastMessage: MessageEntity | null;
};

export class ThreadDTOMapper {
  static map(thread: ThreadEntityWithUsers): ThreadEntityWithUsersDTO {
    return Object.assign(thread.toDTO(), {
      administrator: thread.administrator ? thread.administrator.toDTO() : null,
      participants: thread.participants.map((p) => p.toDTO()),
    });
  }
  static maps(threads: ThreadEntityWithUsers[]): ThreadEntityWithUsersDTO[] {
    return threads.map((thread) => this.map(thread));
  }

  static mapWithLastMessage(
    thread: ThreadEntityWithUsersAndLastMessage,
  ): ThreadEntityWithUsersLastMessageDTO {
    return Object.assign(thread.toDTO(), {
      administrator: thread.administrator ? thread.administrator.toDTO() : null,
      participants: thread.participants.map((p) => p.toDTO()),
      lastMessage: thread.lastMessage,
    });
  }
  static mapsWithLastMessage(
    threads: ThreadEntityWithUsersAndLastMessage[],
  ): ThreadEntityWithUsersLastMessageDTO[] {
    return threads.map((thread) => this.mapWithLastMessage(thread));
  }
}
