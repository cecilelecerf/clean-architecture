
import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = {  userId: UserEntity["id"] ,advisorId?: UserEntity["id"]};

export class GetInteralThreadsByUserUsecas {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    userId
  }: Props): Promise<
    | ThreadEntityWithUsers[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user; 


    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);

    const threadsAdmin =
      await this.threadRepository.findAllWithUserByAdministratorIdAndType(
        userId, "internal"
      );
          const threadsParticipant =
      await this.threadRepository.findAllWithUserByParticipantIdAndType(
        userId, "internal"
      );
      const threads  = [
      ...threadsAdmin,
      ...threadsParticipant,
    ];
    return threads;
  }
}
