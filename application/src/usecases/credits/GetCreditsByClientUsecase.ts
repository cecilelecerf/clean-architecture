import { CreditDTOMapper } from "@application/dto/CreditDTOMapper";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  clientId: UserEntity["id"];
  adminId?: UserEntity["id"];
};

export class GetCreditsByClientUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    clientId,
    adminId,
  }: Props): Promise<
    | CreditDTOMapper[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;
    if (!client.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], client.role);
    if (adminId) {
      const admin = await findActiveUser(this.userRepository, adminId);
      if (admin instanceof Error) return admin;
      if (admin.hasRole({ role: "client" }))
        return new UserRoleMismatchError(
          ["conseiller", "directeur"],
          admin.role
        );
    }

    const credits = await this.creditRepository.findAllByUserId(client.id);
    const creditsMapper = credits.map((credit) =>
      CreditDTOMapper.mapWthFormule(credit)
    );

    return creditsMapper;
  }
}
