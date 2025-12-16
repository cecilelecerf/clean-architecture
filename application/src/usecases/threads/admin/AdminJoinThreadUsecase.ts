import { ThreadNotFoundError } from "@application/errors/threads";
import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { InvalidThreadTypeError, ThreadAlreadyHasAdvisorError,ThreadNotActiveError } from "@domain/errors/thread";
 type Props = { advisorId: UserEntity["id"]; threadId: UserEntity["id"] };

export class AdminJoinThreadUsecase {
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
    | ThreadAlreadyHasAdvisorError|InvalidThreadTypeError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();
 
    if (!advisor.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);

    const error = thread.assignAdvisor(advisor.id);

    if (error instanceof Error) return error;

    await this.threadRepository.update(thread);
    return thread;
  }
}

// domain
/* applicative
    - l'user doit avoir le rôle conseiller
    - le thread doit être actif
    - le thread ne doit pas avoir d'administrateur

*/
