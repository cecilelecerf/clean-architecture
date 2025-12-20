import {
  InvalidThreadAccessError,
  ThreadNotFoundError,
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
  newAdministratorId: UserEntity["id"];
  administratorId: UserEntity["id"];
} & Pick<ThreadEntity, "id">;

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
    | ThreadClosedError
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
      newAdministratorId
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
    const updateThread = thread.transferTo(
      newAdministratorId,
      this.clockService.now()
    );
    if (updateThread instanceof Error) return updateThread;
    this.threadRepository.update(updateThread);
    return updateThread;
  }
}
/*
Règle métier : 
- Le thread doit être ouvert
- L'user doit être différent de l'ancien administrateur
- Doit mettre à jour la date de modification

Règle applicative :
- Le thread doit exister
- Le nouveau admin doit exister
- Le user actuel doit exister
- L'user qui fait la requête doit être un admin
- Le nouvel admin doit être un conseiller si c'est un thread de type external et un director si de type internal
*/
