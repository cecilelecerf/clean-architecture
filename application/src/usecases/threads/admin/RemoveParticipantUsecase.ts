import {
  InvalidThreadAccessError,
  ThreadNotFoundError,
  ParticipantNotFoundError,
  InvalidThreadTypeError,
} from "@application/errors/threads";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadClosedError } from "@domain/errors/thread";

type Props = {
  participantId: UserEntity["id"];
  administratorId: UserEntity["id"];
  threadId: ThreadEntity["id"];
};

export class RemoveParticipantUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    threadId,
    participantId,
    administratorId,
  }: Props): Promise<
    | ThreadEntity
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | ThreadClosedError
    | ParticipantNotFoundError
    | InvalidThreadTypeError
  > {
    const participant = await findActiveUser(
      this.userRepository,
      participantId
    );
    if (participant instanceof Error) return participant;

    const administrator = await findActiveUser(
      this.userRepository,
      administratorId
    );
    if (administrator instanceof Error) return administrator;
    if (administrator.hasRole({ role: "client" })) {
      return new UserRoleMismatchError(
        ["conseiller", "directeur"],
        administrator.role
      );
    }
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();

    if (thread.type === "external")
      return new InvalidThreadTypeError(
        thread.id,
        thread.type,
        "remove participant"
      );

    if (!thread.isAdministrator(administrator.id)) {
      return new InvalidThreadAccessError(administrator.id, thread.id);
    }

    const updatedThread = thread.removeParticipant(
      participant.id,
      this.clockService.now()
    );
    if (updatedThread instanceof Error) return updatedThread;

    await this.threadRepository.update(updatedThread);

    return updatedThread;
  }
}
