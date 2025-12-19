import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity, UserToFront } from "@domain/entities/UserEntity";

type Props = { userId: UserEntity["id"]; role?: UserEntity["role"] };

export class GetUsersByRoleUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    userId,
    role,
  }: Props): Promise<
    | UserToFront[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, userId);
    if (advisor instanceof Error) return advisor;
    if (advisor.hasRole({ role: "client" }))
      return new UserRoleMismatchError(
        ["conseiller", "directeur"],
        advisor.role
      );
    const users = await this.userRepository.findAllByRoleAndIsActif(role);
    return users.map((user) => user.toFront());
  }
}
