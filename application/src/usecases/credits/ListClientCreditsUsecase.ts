import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
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
