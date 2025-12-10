import { InvalidThreadAccessError,ThreadNotFoundError } from "@application/errors/threads";
 import { UserNotActiveError ,UserNotFoundError} from "@application/errors/users";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadClosedError } from "@domain/errors/thread";

type Props = {
  userId: UserEntity["id"];
  administratorId: UserEntity["id"];
} & Pick<ThreadEntity, "id">;

export class RemoveParticipantUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    id,
    userId,
    administratorId,
  }: Props): Promise<
    | ThreadEntity
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | UserNotFoundError
    | UserNotActiveError
    | ThreadClosedError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const administrator = await findActiveUser(
      this.userRepository,
      administratorId
    );
    if (administrator instanceof Error) return administrator;

    const thread = await this.threadRepository.findById(id);
    if (!thread) return new ThreadNotFoundError();

    if (!thread.isAdministrator(administrator.id))
      return new InvalidThreadAccessError(administrator.id, thread.id);

    const updateThread = thread.removeParticipant(
      user.id,
      this.clockService.now()
    );
    if (updateThread instanceof Error) return updateThread;

    this.threadRepository.save(updateThread);
    return updateThread;
  }
}
