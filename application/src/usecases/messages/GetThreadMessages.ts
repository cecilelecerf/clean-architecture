import { InvalidThreadAccessError } from "@application/src/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/src/errors/threads/ThreadNotFoundError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { MessageRepository } from "@application/src/ports/repositories/MessageRepository";
import { ThreadRepository } from "@application/src/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { findActiveUser } from "@application/src/utils/userValidators";
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
    | MessageEntity[]
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
    if (thread.isClose) return new ThreadClosedError(thread.id);

    if (!thread.hasAccess(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);

    return await this.messageRepository.findAllByThread(thread.id);
  }
}
