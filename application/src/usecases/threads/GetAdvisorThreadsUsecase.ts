import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import {
  ThreadEntityWithUsersToFront,
  ThreadToFrontMapper,
} from "@application/toFronts/ThreadToFrontMapper";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = { administratorId: UserEntity["id"] };

export class GetAdvisorThreadsUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    administratorId,
  }: Props): Promise<
    ThreadEntityWithUsersToFront[] | UserNotFoundError | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, administratorId);
    if (user instanceof Error) return user;
    const administratorThread =
      await this.threadRepository.findAllWithUserByAdministratorIdAndType(
        user.id,
        "external"
      );
    const nullableAdministratorThread =
      await this.threadRepository.findAllWithUserByAdministratorNullable();
    const threads: ThreadEntityWithUsers[] = [
      ...administratorThread,
      ...nullableAdministratorThread,
    ];
    return ThreadToFrontMapper.maps(threads);
  }
}
