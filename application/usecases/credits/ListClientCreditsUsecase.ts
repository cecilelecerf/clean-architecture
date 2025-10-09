import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
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
  public async execute({ clientId }: Props): Promise<CreditEntity[]> {
    const client = await this.userRepository.findById(clientId);
    if (!client) throw new UserNotFoundError();
    if (!client.hasRole({ role: "client" }))
      throw new UserRoleMismatchError(["client"], client.role);
    const credits = await this.creditRepository.findAllByUserId(client.id);
    return credits;
  }
}
