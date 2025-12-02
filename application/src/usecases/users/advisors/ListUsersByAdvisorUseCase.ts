import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = { userId: UserEntity["id"] };

export class ListUsersByAdvisorUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    userId,
  }: Props): Promise<
    | UserEntity[]
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
    return await this.userRepository.findAllByRole("client");
  }
}
