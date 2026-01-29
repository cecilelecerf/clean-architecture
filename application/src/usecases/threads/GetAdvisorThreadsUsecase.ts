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
  ThreadEntityWithUsersDTO,
  ThreadDTOMapper,
} from "@application/dto/ThreadDTOMapper";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = { administratorId: UserEntity["id"] };

export class GetAdvisorThreadsUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async execute({
    administratorId,
  }: Props): Promise<
    ThreadEntityWithUsersDTO[] | UserNotFoundError | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, administratorId);
    if (user instanceof Error) return user;
    const administratorThread =
      await this.threadRepository.findAllWithUserAndLastMessageByAdministratorIdAndType(
        user.id,
        "external",
      );
    const nullableAdministratorThread =
      await this.threadRepository.findAllWithUserAndLastMessageByAdministratorNullable();
    const threads: ThreadEntityWithUsers[] = [
      ...administratorThread,
      ...nullableAdministratorThread,
    ];
    return ThreadDTOMapper.maps(threads);
  }
}
