import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import {
  FormuleCreditDTO,
  FormuleCreditEntity,
} from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  userId: UserEntity["id"];
  id: FormuleCreditEntity["id"];
  isActive: boolean;
};

export class ActivationFormuleCreditUseCase {
  constructor(
    private readonly formuleRepository: FormuleCreditRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    userId,
    id,
    isActive,
  }: Props): Promise<
    | FormuleCreditDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | FormuleCreditNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], user.role);

    const formuleCredit = await this.formuleRepository.findById(id);

    if (!formuleCredit) return new FormuleCreditNotFoundError();

    const today = this.clockService.now();
    if (isActive) {
      formuleCredit.enable({ now: today });
    } else {
      formuleCredit.disable({ now: today });
    }

    await this.formuleRepository.update(formuleCredit);

    return formuleCredit.toDTO();
  }
}
