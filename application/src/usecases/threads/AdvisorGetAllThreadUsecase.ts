import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = { administratorId: UserEntity["id"] };

export class AdvisorGetAllThreadUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    administratorId,
  }: Props): Promise<
    ThreadEntityWithUsers[] | UserNotFoundError | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, administratorId);
    if (user instanceof Error) return user;
    console.log(user);
    const administratorThread =
      await this.threadRepository.findAllWithUserByAdministratorId(user.id);
    const nullableAdministratorThread =
      await this.threadRepository.findAllWithUserByAdministratorNullable();
    const threads: ThreadEntityWithUsers[] = [
      ...administratorThread,
      ...nullableAdministratorThread,
    ];
    return threads;
  }
}
