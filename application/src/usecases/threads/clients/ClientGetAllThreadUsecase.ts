
import { UserNotActiveError ,UserNotFoundError} from "@application/errors/users";
import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";

export class ClientGetAllThreadUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute(
    clientId: string
  ): Promise<ThreadEntityWithUsers[] | UserNotFoundError | UserNotActiveError> {
    const user = await findActiveUser(this.userRepository, clientId);
    if (user instanceof Error) return user;

    const threads =
      await this.threadRepository.findAllExternalThreadWithUserByUserId(
        clientId
      );
    return threads;
  }
}
