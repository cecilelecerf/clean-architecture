import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
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
type Props = { advisorId: UserEntity["id"] };

export class DirectorFindAllThreadUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    advisorId,
  }: Props): Promise<
    | ThreadEntityWithUsersToFront[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    if (!advisor.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], advisor.role);

    const threadsParticipant =
      await this.threadRepository.findAllWithUserByParticipantIdAndType(
        advisor.id,
        "internal"
      );
    const threadsAdmin =
      await this.threadRepository.findAllWithUserByAdministratorIdAndType(
        advisor.id,
        "internal"
      );
    return ThreadToFrontMapper.maps(threadsAdmin.concat(threadsParticipant));
  }
}
