import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity, UserToDTO } from "@domain/entities/UserEntity";

type Props = { clientId: UserEntity["id"]; advisorId: UserEntity["id"] };

export class GetUserUsercase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    clientId,
    advisorId,
  }: Props): Promise<
    UserToDTO | UserNotFoundError | UserNotActiveError | UserRoleMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    if (advisor.hasRole({ role: "client" }))
      return new UserRoleMismatchError(
        ["conseiller", "directeur"],
        advisor.role
      );
    const user = await this.userRepository.findById(clientId);
    if (!user) return new UserNotFoundError();
    return user.toDTO();
  }
}
