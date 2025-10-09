import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  clientId: UserEntity["id"];
  actorId: UserEntity["id"];
};
export class BanClientUsecase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({ clientId, actorId }: Props): Promise<void> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw new UserNotFoundError();
    if (!actor.hasRole({ role: "directeur" }))
      throw new UserRoleMismatchError(["directeur"], actor.role);

    const user = await this.userRepository.findById(clientId);
    if (!user) throw new UserNotFoundError();
    if (!user.hasRole({ role: "client" }))
      throw new UserRoleMismatchError(["client"], user.role);

    user.ban();
    await this.userRepository.saveUser(user);
  }
}
