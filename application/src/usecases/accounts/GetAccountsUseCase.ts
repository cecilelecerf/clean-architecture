import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountDTO } from "@domain/entities/AccountEntity";

type Props = { clientId: string; requesterId?: string };
export class GetAccountsUseCase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    clientId,
    requesterId,
  }: Props): Promise<
    | AccountDTO[]
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) {
      return client;
    }

    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);
    if (requesterId) {
      const requester = await findActiveUser(this.userRepository, requesterId);
      if (requester instanceof Error) {
        return requester;
      }
      if (requester.hasRole({ role: "client" }) && requester.id !== client.id)
        return new UserRoleMismatchError(
          ["conseiller", "directeur"],
          requester.role
        );
    }

    const accounts = await this.accountRepository.findByUserId(client.id);
    return accounts.map((account) => account.toDTO());
  }
}
