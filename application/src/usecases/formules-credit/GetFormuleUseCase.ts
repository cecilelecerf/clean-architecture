import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import {
  FormuleCreditDTO,
  FormuleCreditEntity,
} from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  userId: UserEntity["id"];
  formuleId: FormuleCreditEntity["id"];
};

export class GetFormuleUsecase {
  constructor(
    private readonly formuleRepository: FormuleCreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
    formuleId,
  }: Props): Promise<
    | FormuleCreditDTO
    | UserNotFoundError
    | UserNotActiveError
    | FormuleCreditNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const formuleCredit = await this.formuleRepository.findById(formuleId);
    if (!formuleCredit) return new FormuleCreditNotFoundError();

    return formuleCredit.toDTO();
  }
}
