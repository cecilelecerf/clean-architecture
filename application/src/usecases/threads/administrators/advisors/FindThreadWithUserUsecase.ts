import { ThreadNotFoundError } from "@application/errors/threads";
import { UserNotActiveError ,UserNotFoundError} from "@application/errors/users";
import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";

export class FindThreadWithUserUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute(
    threadId: string,
    clientId: string
  ): Promise<
    | ThreadEntityWithUsers
    | UserNotFoundError
    | UserNotActiveError
    | ThreadNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, clientId);
    if (user instanceof Error) return user;
    const thread = await this.threadRepository.findWithUserById(threadId);
    if (!thread) return new ThreadNotFoundError();
    return thread;
  }
}
