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
import {
  ThreadEntityWithUsersDTO,
  ThreadDTOMapper,
} from "@application/dto/ThreadDTOMapper";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = { threadId: ThreadEntity["id"]; userId: UserEntity["id"] };

export class GetThreadByIdUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    threadId,
    userId,
  }: Props): Promise<
    | ThreadEntityWithUsersDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | InvalidThreadAccessError
    | ThreadNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const thread = await this.threadRepository.findWithUserById(threadId);
    if (!thread) return new ThreadNotFoundError();
    if (!thread.hasAccess(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);

    return ThreadDTOMapper.map(thread);
  }
}
