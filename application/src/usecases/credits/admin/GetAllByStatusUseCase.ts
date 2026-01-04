import { CreditDTOMapper } from "@application/dto/CreditDTOMapper";
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
import { InvalidCreditStatusError } from "@domain/errors/credit";

type Props = {
  status: string | null;
  actorId: UserEntity["id"];
};

export class GetAllByStatusUseCase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    status: statusStr,
    actorId,
  }: Props): Promise<
    | CreditDTOMapper[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | InvalidCreditStatusError
  > {
    let creditStatus: CreditEntity["status"] | undefined = undefined;
    if (statusStr) {
      const creditVo = CreditEntity.validateCreditStatus(statusStr);
      if (creditVo instanceof Error) return creditVo;
      creditStatus = creditVo;
    }
    const advisor = await findActiveUser(this.userRepository, actorId);
    if (advisor instanceof Error) return advisor;

    if (!advisor.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);

    const credits = await this.creditRepository.findAllByStatus(creditStatus);

    return credits.map((credit) => CreditDTOMapper.mapWthFormule(credit));
  }
}
