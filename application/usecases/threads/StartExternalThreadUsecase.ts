import { InvalidThreadParticipantsError } from "@application/errors/threads/InvalidThreadParticipantsError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { ThreadEntity } from "@domain/entities/ThreadEntity";

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
  > {
    const advisor = await this.userRepository.findById(administratorId);
    if (!advisor) return new UserNotFoundError();
    if (!advisor?.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);

    if (participantsId.length !== 1)
      return new InvalidThreadParticipantsError();

    const client = await this.userRepository.findById(participantsId[0]);
    if (!client) return new UserNotFoundError();
    if (!client?.hasRole({ role: "client" })) return new UserNotFoundError();

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();

    const thread = ThreadEntity.from({
      id,
      createdAt,
      type: "external",
      participantsId,
      administratorId,
      title,
      isClose: false,
    });
    this.threadRepository.save(thread);
    return thread;
  }
}
