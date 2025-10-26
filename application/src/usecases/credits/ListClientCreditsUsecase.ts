import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/src/errors/users/UserRoleMismatchError";
import { CreditRepository } from "@application/src/ports/repositories/CreditRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { findActiveUser } from "@application/src/utils/userValidators";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  clientId: UserEntity["id"];
};

export class ClientCreditsUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    clientId,
  }: Props): Promise<
    | CreditEntity[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;
    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);
    const credits = await this.creditRepository.findAllByUserId(client.id);
    return credits;
  }
}
