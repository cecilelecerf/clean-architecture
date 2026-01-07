import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity, UserToDTO } from "@domain/entities/UserEntity";

type Props = { userId: UserEntity["id"]; role?: string };

export class GetUsersByRoleUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    userId,
    role,
  }: Props): Promise<
    UserToDTO[] | UserNotFoundError | UserNotActiveError | UserRoleMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, userId);
    if (advisor instanceof Error) return advisor;
    if (advisor.hasRole({ role: "client" }))
      return new UserRoleMismatchError(
        ["conseiller", "directeur"],
        advisor.role
      );

    if (role && !UserEntity.isUserRole(role))
      return new UserRoleMismatchError(
        [],
        role as "client" | "directeur" | "conseiller"
      );

    const users = await this.userRepository.findAllByRoleAndIsActif(
      role as "client" | "directeur" | "conseiller"
    );
    return users.map((user) => user.toDTO());
  }
}
