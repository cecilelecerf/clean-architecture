import { InvalidThreadAccessError } from "@application/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/errors/threads/ThreadNotFoundError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { ThreadEntity } from "@domain/entities/ThreadEntity";

type Props = { newAdministratorId: ThreadEntity["administratorId"] } & Pick<
  ThreadEntity,
  "id" | "administratorId"
>;

export class TransferThreadUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    id,
    newAdministratorId,
    administratorId,
  }: Props): Promise<
    | ThreadEntity
    | UserNotFoundError
    | UserRoleMismatchError
    | ThreadNotFoundError
    | InvalidThreadAccessError
  > {
    const administrator = await this.userRepository.findById(administratorId);
    if (!administrator) return new UserNotFoundError();

    const thread = await this.threadRepository.findById(id);
    if (!thread) return new ThreadNotFoundError();

    const newAdministrator = await this.userRepository.findById(
      newAdministratorId
    );
    if (!newAdministrator) return new UserNotFoundError();

    if (!thread.isAdministrator(administrator.id))
      return new InvalidThreadAccessError(administrator.id, thread.id);

    const expectedRole =
      thread.type === "external" ? "conseiller" : "directeur";
    if (!administrator.hasRole({ role: expectedRole }))
      return new UserRoleMismatchError([expectedRole], administrator.role);
    if (!newAdministrator.hasRole({ role: expectedRole }))
      return new UserRoleMismatchError([expectedRole], newAdministrator.role);

    thread.transferTo(newAdministratorId, this.clockService.now());
    this.threadRepository.update(thread);
    return thread;
  }
}
