
import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = {  clientId: UserEntity["id"] ,advisorId?: UserEntity["id"]};

export class GetExternalThreadsByUserUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    clientId,
    advisorId,
  }: Props): Promise<
    | ThreadEntityWithUsers[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const user = await findActiveUser(this.userRepository, clientId);
    if (user instanceof Error) return user;
    if(advisorId){
      const advisor = await findActiveUser(this.userRepository, advisorId);
      if (advisor instanceof Error) return advisor;
  
      if (!advisor.hasRole({ role: "conseiller" }))
        return new UserRoleMismatchError(["conseiller"], advisor.role);
    }

    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);

    const threads =
      await this.threadRepository.findAllWithUserByParticipantIdAndType(
        clientId,
        "external"
      );
    return threads;
  }
}
