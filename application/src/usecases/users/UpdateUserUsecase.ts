import {
  UserNotFoundError,
  UserNotActiveError,
  UserRoleMismatchError,
  EmailAlreadyExistsError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { Address, UserEntity, UserToDTO } from "@domain/entities/UserEntity";
import { EmailInvalidFormatError } from "@domain/errors/email/EmailInvalidFormatError";
import {
  DateOfBirthInFutureError,
  DateOfBirthRequiredError,
  DateOfBirthTooOldError,
  InvalidDateOfBirthError,
  InvalidPhoneNumberError,
  InvalidSexeError,
  PhoneNumberRequiredError,
  SexeRequiredError,
  UserTooYoungError,
} from "@domain/errors/user";
import { InvalidFirstnameError } from "@domain/errors/user/InvalidFirstnameError";
import { InvalidLastnameError } from "@domain/errors/user/InvalidLastnameError";

type Props = {
  userId: string;
  actorId: string;
  dateOfBirth?: string;
  address?: Partial<Address>;
} & Partial<
  Pick<UserEntity, "firstname" | "lastname" | "phoneNumber" | "sexe">
>;

export class UpdateUserUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  public async execute({
    userId,
    actorId,
    firstname,
    lastname,
    dateOfBirth,
    address,
    phoneNumber,
    sexe,
  }: Props): Promise<
    | UserToDTO
    | UserNotFoundError
    | UserNotActiveError
    | EmailInvalidFormatError
    | EmailAlreadyExistsError
    | UserRoleMismatchError
    | InvalidFirstnameError
    | InvalidLastnameError
    | PhoneNumberRequiredError
    | InvalidPhoneNumberError
    | SexeRequiredError
    | InvalidSexeError
    | DateOfBirthRequiredError
    | InvalidDateOfBirthError
    | DateOfBirthInFutureError
    | DateOfBirthTooOldError
    | UserTooYoungError
  > {
    const user = await this.userRepository.findById(userId);
    if (!user) return new UserNotFoundError();

    if (!user.isActive) return new UserNotActiveError(userId);

    const actor = await this.userRepository.findById(actorId);
    if (!actor) return new UserNotFoundError();

    if (!actor.isActive) return new UserNotActiveError(actorId);

    const canUpdate =
      actorId === userId || actor.hasRole({ role: "directeur" });

    if (!canUpdate) {
      return new UserRoleMismatchError(["directeur", "self"], actor.role);
    }

    const now = this.clockService.now();
    const updateResult = user.update({
      firstname,
      lastname,
      sexe,
      dateOfBirth,
      phoneNumber,
      address,
      now,
    });

    if (updateResult instanceof Error) return updateResult;

    await this.userRepository.update(updateResult);

    return updateResult.toDTO();
  }
}
