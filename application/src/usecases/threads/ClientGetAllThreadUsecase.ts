import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
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
      await this.threadRepository.findOpenThreadsWithUserByParticipantId(
        clientId
      );
    threads.map((thread) => {
      const { participants, ...rest } = thread;
      return rest;
    });
    return threads;
  }
}
