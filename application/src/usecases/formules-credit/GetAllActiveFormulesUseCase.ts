import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { FormuleCreditDTO } from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  userId: UserEntity["id"];
};

export class GetAllActiveFormulesUsecase {
  constructor(
    private readonly formuleRepository: FormuleCreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
  }: Props): Promise<
    FormuleCreditDTO[] | UserNotFoundError | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const formules = await this.formuleRepository.findAllActive();
    console.log(formules);
    return formules.map((formule) => formule.toDTO());
  }
}
