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
import { InvalidTitleError } from "@domain/errors/thread/InvalidTitleError";

type Props = {} & Pick<
  ThreadEntity,
  "title" | "participantsId" | "administratorId"
>;

export class StartExternalThreadUsecase {
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
    const advisor = await findActiveUser(this.userRepository, administratorId);
    if (advisor instanceof Error) return advisor;

    if (!advisor?.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);

    if (participantsId.length !== 1)
      return new InvalidThreadParticipantsError();

    const client = await findActiveUser(this.userRepository, participantsId[0]);
    if (client instanceof Error) return client;

    if (!client?.hasRole({ role: "client" })) return new UserNotFoundError();

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();

    const thread = ThreadEntity.create({
      id,
      createdAt,
      type: "external",
      participantsId,
      administratorId,
      title,
      isClose: false,
    });
    if (thread instanceof Error) return thread;

    await this.threadRepository.save(thread);
    return thread;
  }
}
