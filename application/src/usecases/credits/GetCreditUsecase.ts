import {
  CreditDTOMapper,
  CreditDTOWithFormuleAndAccount,
} from "@application/dto/CreditDTOMapper";
import { CreditNotFoundError } from "@application/errors/credits";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  actorId: UserEntity["id"];
  creditId: CreditEntity["id"];
};

export class GetCreditUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    actorId,
    creditId,
  }: Props): Promise<
    | CreditDTOWithFormuleAndAccount
    | UserNotFoundError
    | UserNotActiveError
    | CreditNotFoundError
  > {
    console.log("enter");
    const actor = await findActiveUser(this.userRepository, actorId);
    if (actor instanceof Error) return actor;
    const credit = await this.creditRepository.findByIdWithDetails(creditId);
    if (!credit) return new CreditNotFoundError();
    console.log(credit.account.userId, actor.id);
    if (
      actor.hasRole({ role: "client" }) &&
      credit.account.user.id !== actor.id
    )
      return new CreditNotFoundError();

    return CreditDTOMapper.map(credit);
  }
}
