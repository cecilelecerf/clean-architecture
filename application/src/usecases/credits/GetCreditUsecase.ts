import { CreditNotFoundError } from "@application/errors/credits";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditDTO, CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  creditId: CreditEntity["id"];
  userId: UserEntity["id"];
};

export class GetCreditUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    creditId,
    userId,
  }: Props): Promise<
    | CreditDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | CreditNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    const credit = await this.creditRepository.findById(creditId);
    if (!credit) return new CreditNotFoundError();
    console.log(user);
    if (user.hasRole({ role: "client" }) && credit.userId !== user.id)
      return new UserRoleMismatchError(["client"], user.role);
    return credit.toDTO();
  }
}
