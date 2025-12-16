import { InvalidThreadAccessError,ThreadNotFoundError } from "@application/errors/threads";
 import { UserNotActiveError ,UserNotFoundError} from "@application/errors/users";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
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

    this.threadRepository.update(thread);
    return thread;
  }
}
