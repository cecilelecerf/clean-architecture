import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditDTO } from "@domain/entities/CreditEntity";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  actorId: UserEntity["id"];
  formuleId: FormuleCreditEntity["id"];
};

export class GetAllByFormuleUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository,
    private readonly formuleRepository: FormuleCreditRepository
  ) {}

  public async execute({
    actorId,
    formuleId,
  }: Props): Promise<
    | CreditDTO[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | FormuleCreditNotFoundError
  > {
    const actor = await findActiveUser(this.userRepository, actorId);
    if (actor instanceof Error) return actor;
    if (!actor.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], actor.role);

    const formule = await this.formuleRepository.findById(formuleId);
    if (!formule) return new FormuleCreditNotFoundError();

    const credits = await this.creditRepository.findAllByFormuleId(formuleId);

    return credits.map((credit) => credit.toDTO());
  }
}
