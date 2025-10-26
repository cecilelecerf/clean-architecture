import { InvalidThreadAccessError } from "@application/src/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/src/errors/threads/ThreadNotFoundError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { ThreadRepository } from "@application/src/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { ClockService } from "@application/src/ports/services/ClockService";
import { findActiveUser } from "@application/src/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = { userId: UserEntity["id"]; threadId: ThreadEntity["id"] };

export class CloseThreadUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    threadId,
    userId,
  }: Props): Promise<
    | ThreadEntity
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | UserNotFoundError
    | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();

    if (!thread.isAdministrator(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);

    thread.close(this.clockService.now());

    this.threadRepository.save(thread);
    return thread;
  }
}
