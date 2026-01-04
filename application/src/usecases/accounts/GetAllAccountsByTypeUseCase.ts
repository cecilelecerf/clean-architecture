import {
  AccountDTOMapper,
  AccountDTOWithUser,
} from "@application/dto/AccountDTOMapper";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { InvalidAccountTypeError } from "@domain/errors/account/InvalidAccountType";

type Props = {
  userId: string;
  type: AccountTypeSection;
};

const VALID_ACCOUNT_TYPES = ["client", "bank"] as const;
type AccountTypeSection = (typeof VALID_ACCOUNT_TYPES)[number];

export class GetAllAccountsByTypeUserCase {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
    type,
  }: Props): Promise<
    | AccountDTOWithUser[]
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | InvalidAccountTypeError
  > {
    if (!VALID_ACCOUNT_TYPES.includes(type as any)) {
      return new InvalidAccountTypeError();
    }
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) {
      return user;
    }

    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);
    const accountsWithUser =
      await this.accountRepository.findByTypeSectionWithUser(type);
    return AccountDTOMapper.maps(accountsWithUser);
  }
}
