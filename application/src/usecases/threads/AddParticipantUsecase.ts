import { InvalidThreadAccessError } from "@application/src/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/src/errors/threads/ThreadNotFoundError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { ThreadRepository } from "@application/src/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { ClockService } from "@application/src/ports/services/ClockService";
import { findActiveUser } from "@application/src/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadParticipantAlreadyExistError } from "@domain/errors/thread/ThreadParticipantAlreadyExistError";

type Props = { userId: UserEntity["id"] } & Pick<
  ThreadEntity,
  "id" | "administratorId"
>;

export class AddParticipantUsecase {
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
    | ThreadParticipantAlreadyExistError
    | UserNotActiveError
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

    const updateThread = thread.addParticipant(
      user.id,
      this.clockService.now()
    );
    if (updateThread instanceof Error) return updateThread;

    this.threadRepository.save(updateThread);
    return updateThread;
  }
}
