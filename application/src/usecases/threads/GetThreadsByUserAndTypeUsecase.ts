
import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
type Props = {  userId: UserEntity["id"] ,type ?: ThreadEntity["type"], advisorId?: UserEntity["id"]};

export class GetThreadsByUserAndTypeUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}
  async execute({
    userId,
    type,
    advisorId
  }: Props): Promise<
    | ThreadEntityWithUsers[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user; 
    console.log("usecase")
console.log(type)
    if(type === "external"){
      if(advisorId){
        const advisor = await findActiveUser(this.userRepository, advisorId);
        if (advisor instanceof Error) return advisor;
    
        if (!advisor.hasRole({ role: "conseiller" }))
          return new UserRoleMismatchError(["conseiller"], advisor.role);
      }
          if (user.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["conseiller", "client"], user.role);

    }else if(type==="internal") {
          if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);
    }

    const threadsAdmin =
      await this.threadRepository.findAllWithUserByAdministratorIdAndType(
        userId, type
      );
      console.log(threadsAdmin)
           const threadsParticipant =
      await this.threadRepository.findAllWithUserByParticipantIdAndType(
        userId, type
      );
      const threads  = [
      ...threadsAdmin,
      ...threadsParticipant,
    ];
    return threads;
  }
}
