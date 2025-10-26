import { InvalidThreadParticipantsError } from "@application/src/errors/threads/InvalidThreadParticipantsError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/src/errors/users/UserRoleMismatchError";
import { ThreadRepository } from "@application/src/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { ClockService } from "@application/src/ports/services/ClockService";
import { UuidService } from "@application/src/ports/services/UuidService";
import { findActiveUser } from "@application/src/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { InvalidTitleError } from "@domain/errors/thread/InvalidTitleError";

type Props = {} & Pick<
  ThreadEntity,
  "title" | "participantsId" | "administratorId"
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
