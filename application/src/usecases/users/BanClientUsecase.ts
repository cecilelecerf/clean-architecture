
import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  clientId: UserEntity["id"];
  actorId: UserEntity["id"];
};
export class BanClientUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

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
    user.modifiedAt = this.clockService.now();

    await this.userRepository.update(user);
    return user;
  }
}
