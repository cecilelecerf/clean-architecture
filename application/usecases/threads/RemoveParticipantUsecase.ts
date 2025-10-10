import { InvalidThreadAccessError } from "@application/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/errors/threads/ThreadNotFoundError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
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
    ThreadEntity | ThreadNotFoundError | InvalidThreadAccessError | Error
  > {
    const user = await this.userRepository.findById(userId);
    if (!user) return new UserNotFoundError();

    const administrator = await this.userRepository.findById(administratorId);
    if (!administrator) return new UserNotFoundError();

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
