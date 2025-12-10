import { InvalidThreadParticipantsError } from "@application/errors/threads/InvalidThreadParticipantsError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { InvalidTitleError } from "@domain/errors/thread";

type Props = { administratorId: UserEntity["id"] } & Pick<
  ThreadEntity,
  "title" | "participantsId"
>;

export class StartInternalThreadUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    title,
    participantsId,
    administratorId,
  }: Props): Promise<
    | ThreadEntity
    | UserNotFoundError
    | UserRoleMismatchError
    | InvalidThreadParticipantsError
    | UserNotActiveError
    | InvalidTitleError
  > {
    const administrator = await findActiveUser(
      this.userRepository,
      administratorId
    );
    if (administrator instanceof Error) return administrator;

    if (!administrator?.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], administrator.role);

    participantsId.map(async (participantId) => {
      const participant = await findActiveUser(
        this.userRepository,
        participantId
      );
      if (participant instanceof Error) return participant;

      if (!participant?.hasRole({ role: "conseiller" }))
        return new UserRoleMismatchError(["conseiller"], participant.role);
    });

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();

    const thread = ThreadEntity.create({
      id,
      createdAt,
      type: "internal",
      participantsId,
      administratorId,
      title,
      isClose: false,
    });

    if (thread instanceof Error) return thread;

    this.threadRepository.save(thread);
    return thread;
  }
}
