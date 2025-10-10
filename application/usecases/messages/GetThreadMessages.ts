import { InvalidThreadAccessError } from "@application/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/errors/threads/ThreadNotFoundError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { MessageRepository } from "@application/ports/repositories/MessageRepository";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";

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
  > {
    const user = await this.userRepository.findById(userId);
    if (!user) return new UserNotFoundError();

    const thread = await this.threadRepository.findById(id);
    if (!thread) return new ThreadNotFoundError();

    if (!thread.hasAccess(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);

    return await this.messageRepository.findAllByThread(thread.id);
  }
}
