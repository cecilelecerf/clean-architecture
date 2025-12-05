import { InvalidThreadAccessError } from "@application/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/errors/threads/ThreadNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadClosedError } from "@domain/errors/thread/ThreadClosedError";

type Props = { userId: UserEntity["id"] } & Pick<ThreadEntity, "id">;

export class GetThreadMessages {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly messageRepository: MessageRepository
  ) {}
  public async execute({
    userId,
    id,
  }: Props): Promise<
    | MessageWithUser[]
    | UserNotFoundError
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | ThreadClosedError
    | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const thread = await this.threadRepository.findById(id);
    if (!thread) return new ThreadNotFoundError();
    if (thread.administratorId && !thread.hasAccess(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);
<<<<<<< HEAD:application/src/usecases/messages/GetThreadWithUserMessages.ts
    const messages = await this.messageRepository.findAllWithUserByThread(
      thread.id
    );
=======
    const messages = await this.messageRepository.findAllByThread(thread.id);
>>>>>>> 2ce9cab (thread):application/src/usecases/messages/GetThreadMessages.ts
    return messages;
  }
}
