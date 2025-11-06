import { ThreadNotFoundError } from "@application/errors/threads/ThreadNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadAlreadyHasAdvisorError } from "@domain/errors/thread/ThreadAlreadyHasAdvisorError";
import { ThreadNotActiveError } from "@domain/errors/thread/ThreadNotActiveError";
type Props = { advisorId: UserEntity["id"]; threadId: UserEntity["id"] };

export class AdvisorJoinExternalThread {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    advisorId,
    threadId,
  }: Props): Promise<
    | ThreadEntity
    | UserNotFoundError
    | UserNotActiveError
    | ThreadNotFoundError
    | UserRoleMismatchError
    | ThreadNotActiveError
    | ThreadAlreadyHasAdvisorError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();

    if (!advisor.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);
    const error = thread.assignAdvisor(advisor.id);
    if (error instanceof Error) return error;
    await this.threadRepository.save(thread);
    return thread;
  }
}

// domain
/* applicative
    - l'user doit avoir le rôle conseiller
    - le thread doit être actif
    - le thread ne doit pas avoir d'administrateur

*/
