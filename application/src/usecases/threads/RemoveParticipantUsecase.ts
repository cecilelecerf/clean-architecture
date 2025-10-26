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

type Props = { userId: UserEntity["id"] } & Pick<
  ThreadEntity,
  "id" | "administratorId"
>;

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
