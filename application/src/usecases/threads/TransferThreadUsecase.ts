import { InvalidThreadAccessError } from "@application/src/errors/threads/InvalidThreadAccessError";
import { ThreadNotFoundError } from "@application/src/errors/threads/ThreadNotFoundError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/src/errors/users/UserRoleMismatchError";
import { ThreadRepository } from "@application/src/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { ClockService } from "@application/src/ports/services/ClockService";
import { findActiveUser } from "@application/src/utils/userValidators";
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
    | UserNotActiveError
  > {
    const administrator = await findActiveUser(
      this.userRepository,
      administratorId
    );
    if (administrator instanceof Error) return administrator;

    const thread = await this.threadRepository.findById(id);
    if (!thread) return new ThreadNotFoundError();

    const newAdministrator = await findActiveUser(
      this.userRepository,
      administratorId
    );
    if (newAdministrator instanceof Error) return newAdministrator;
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
/*
Règle métier : 
- Le thread doit être ouvert
- L'user doit être différent de l'ancien administrateur
- Doit mettre à jouir la date de modification

Règle applicative :
- Le thread doit exister
- Le nouveau admin doit exister
- Le user actuel doit exister
- L'user qui fait la requête doit être un admin
- Le nouvel admin doit être un conseiller si c'est un thread de type external et un director si de type internal
*/
