import {
  UserNotFoundError,
  UserNotActiveError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity, UserToDTO } from "@domain/entities/UserEntity";
import { UserCannotUnbanDirectorError } from "@domain/errors/user/UserCannotUnbanDirectorError";
import { UserNotBannedError } from "@domain/errors/user/UserNotBannedError";

type Props = {
  targetUserId: UserEntity["id"];
  actorId: UserEntity["id"];
};

export class UnbanUserUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    targetUserId,
    actorId,
  }: Props): Promise<
    | UserToDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | UserNotBannedError
    | UserCannotUnbanDirectorError
  > {
    const actor = await findActiveUser(this.userRepository, actorId);
    if (actor instanceof Error) return actor;

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      return new UserNotFoundError();
    }
    if (
      !actor.hasRole({ role: "directeur" }) &&
      targetUser.hasRole({ role: "conseiller" })
    ) {
      return new UserRoleMismatchError(["directeur"], actor.role);
    }
    const unbanResult = targetUser.unban(this.clockService.now());
    if (unbanResult instanceof Error) {
      return unbanResult;
    }

    await this.userRepository.update(targetUser);

    return targetUser.toDTO();
  }
}
