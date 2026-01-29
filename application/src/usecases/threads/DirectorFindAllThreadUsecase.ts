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
  ThreadEntityWithUsersDTO,
  ThreadDTOMapper,
} from "@application/dto/ThreadDTOMapper";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = { advisorId: UserEntity["id"] };

export class DirectorFindAllThreadUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async execute({
    advisorId,
  }: Props): Promise<
    | ThreadEntityWithUsersDTO[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    if (!advisor.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], advisor.role);

    const threadsParticipant =
      await this.threadRepository.findAllWithUserAndLastMessageByParticipantIdAndType(
        advisor.id,
        "internal",
      );
    const threadsAdmin =
      await this.threadRepository.findAllWithUserAndLastMessageByAdministratorIdAndType(
        advisor.id,
        "internal",
      );
    return ThreadDTOMapper.maps(threadsAdmin.concat(threadsParticipant));
  }
}
