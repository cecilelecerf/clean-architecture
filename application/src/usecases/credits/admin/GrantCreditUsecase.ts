import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditDTO } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { CreditNotFoundError } from "@application/errors/credits";
import { CreditStatusMismatchError } from "@application/errors/credits/CreditStatusMismatchError";
import { ClockService } from "@application/ports/services/ClockService";

type Props = {
  advisorId: UserEntity["id"];
  creditId: string;
  accept: boolean;
  reason: string;
};

export class GrantCreditUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    advisorId,
    creditId,
    accept,
    reason,
  }: Props): Promise<
    | CreditDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | CreditNotFoundError
    | CreditStatusMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;
    if (!advisor.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);
    const credit = await this.creditRepository.findById(creditId);
    if (!credit) return new CreditNotFoundError();
    const now = this.clockService.now();

    credit.assignAdvisor({ advisorId: advisor.id, now });
    const actionCredit = accept
      ? credit.accept({ now })
      : credit.refuse({ now, reason });
    if (actionCredit instanceof Error) return actionCredit;
    await this.creditRepository.update(actionCredit);
    return actionCredit.toDTO();
  }
}
