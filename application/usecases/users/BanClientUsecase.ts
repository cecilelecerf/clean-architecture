import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  clientId: UserEntity["id"];
  actorId: UserEntity["id"];
};
export class BanClientUsecase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    clientId,
    actorId,
  }: Props): Promise<
    UserEntity | UserNotFoundError | UserNotActiveError | UserRoleMismatchError
  > {
    const actor = await findActiveUser(this.userRepository, actorId);
    if (actor instanceof Error) return actor;
    if (!actor.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], actor.role);

    const user = await findActiveUser(this.userRepository, clientId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);

    user.ban();
    await this.userRepository.save(user);
    return user;
  }
}
