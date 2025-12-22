import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity"; 
import { CreditNotFoundError } from "@application/errors/credits";
import { CreditStatusMismatchError } from "@application/errors/credits/CreditStatusMismatchError";

type Props = {
  advisorId: UserEntity["id"];
  creditId: string;
  accept: boolean;
};

export class GrantCreditUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    advisorId,
    creditId,
    accept
  }: Props): Promise<
    | CreditEntity
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | CreditNotFoundError
    | CreditStatusMismatchError
  > {
    // Conseiller qui accepte ou non le credit
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;
    if (!advisor.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);

    const credit = await this.creditRepository.findById(creditId);
    if (!credit) return new CreditNotFoundError();

    if (credit.status !== CreditStatus.PENDING) {
      return new CreditStatusMismatchError(credit.status);
    }

    credit.assignAdvisor(advisorId);
    accept ? credit.accept() : credit.refuse();
    if(credit instanceof Error) return credit;

    await this.creditRepository.update(credit);
    return credit;
  }
}
