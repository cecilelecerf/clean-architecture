import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
  EmailAlreadyExistsError,
  InvalidRoleError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { PasswordGenerateService } from "@application/ports/services/PasswordGenerateService";
import { TokenService } from "@application/ports/services/TokenService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity, UserToDTO } from "@domain/entities/UserEntity";
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
import { Email } from "@domain/values/Email";

type Props = {
  email: string;
  confirmationUrl: string;
  directorId: UserEntity["id"];
  role: string;
} & Pick<UserEntity, "firstname" | "lastname">;
export class RegisterAdminUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly passwordGenerateService: PasswordGenerateService
  ) {}

  public async execute({
    firstname,
    lastname,
    email,
    confirmationUrl,
    directorId,
    role,
  }: Props): Promise<
    | UserToDTO
    | UserNotFoundError
    | UserNotActiveError
    | EmailInvalidFormatError
    | EmailAlreadyExistsError
    | UserRoleMismatchError
    | InvalidRoleError
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
    const actor = await findActiveUser(this.userRepository, directorId);
    if (actor instanceof Error) return actor;

    if (!actor.hasRole({ role: "directeur" }))
      return new UserRoleMismatchError(["directeur"], actor.role);

    if (!(role === "conseiller" || role === "directeur")) {
      return new InvalidRoleError(role, ["conseiller", "directeur"]);
    }

    const emailVO = Email.create(email);
    if (emailVO instanceof Error) return emailVO;

    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) return new EmailAlreadyExistsError(emailVO);

    const plainedPassword = this.passwordGenerateService.generate();
    const passwordHash = await this.encryptionService.hash(plainedPassword);

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();

    const user = UserEntity.create({
      id,
      email: emailVO,
      firstname,
      lastname,
      passwordHash,
      createdAt,
      role: role as UserEntity["role"],
    });
    if (user instanceof Error) return user;
    await this.userRepository.save(user);

    const token = await this.tokenService.generateConfirmationToken({
      userId: user.id,
    });
    const confirmationLink = `${confirmationUrl}/confirm-email?token=${token}`;

    this.emailService.sendAdminWelcomeEmail(user.email, {
      ...user,
      confirmationLink,
      temporaryPassword: plainedPassword,
      email: user.email.value,
    });
    return user.toDTO();
  }
}
