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
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = { advisorId: UserEntity["id"] };

export class AdvisorGetAllByParticipantThreadUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    advisorId,
  }: Props): Promise<
    | ThreadEntityWithUsers[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    if (!advisor.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);

    const threads = await this.threadRepository.findAllWithUserByParticipantId(
      advisor.id
    );
    console.log("threads");
    return threads;
  }
}
