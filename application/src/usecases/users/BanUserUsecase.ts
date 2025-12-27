import {
  UserNotFoundError,
  UserNotActiveError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity, UserToDTO } from "@domain/entities/UserEntity";
import {
  UserAlreadyBannedError,
  UserCannotBanDirectorError,
  UserCannotBanSelfError,
} from "@domain/errors/user";

type Props = {
  targetUserId: UserEntity["id"];
  actorId: UserEntity["id"];
};

export class BanUserUsecase {
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
    | UserAlreadyBannedError
    | UserCannotBanSelfError
    | UserCannotBanDirectorError
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

    if (targetUser.hasRole({ role: "directeur" })) {
      return new UserRoleMismatchError(
        ["client", "conseiller"],
        targetUser.role
      );
    }

    const verifyBan = targetUser.ban(actor.id, this.clockService.now());
    if (verifyBan instanceof Error) return verifyBan;

    await this.userRepository.update(targetUser);

    return targetUser.toDTO();
  }
}
