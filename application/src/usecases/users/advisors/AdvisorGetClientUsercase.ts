import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = { clientId: UserEntity["id"]; advisorId: UserEntity["id"] };

export class AdvisorGetClientUsercase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    clientId,
    advisorId,
  }: Props): Promise<
    UserEntity | UserNotFoundError | UserNotActiveError | UserRoleMismatchError
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
    return user;
  }
}
