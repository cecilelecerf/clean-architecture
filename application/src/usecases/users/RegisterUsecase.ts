import {
  EmailAlreadyExistsError,
  UserNotFoundError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { TokenService } from "@application/ports/services/TokenService";
import { UuidService } from "@application/ports/services/UuidService";
import { UserEntity, UserToDTO } from "@domain/entities/UserEntity";
import { EmailInvalidFormatError } from "@domain/errors/email/EmailInvalidFormatError";
import {
  AddressMissingNumberError,
  AddressRequiredError,
  AddressTooLongError,
  AddressTooShortError,
  CityInvalidCharactersError,
  CityRequiredError,
  CityTooLongError,
  CityTooShortError,
  CountryInvalidCharactersError,
  CountryRequiredError,
  CountryTooLongError,
  CountryTooShortError,
  DateOfBirthInFutureError,
  DateOfBirthRequiredError,
  DateOfBirthTooOldError,
  InvalidDateOfBirthError,
  InvalidPhoneNumberError,
  InvalidSexeError,
  PhoneNumberRequiredError,
  PostalCodeInvalidCharactersError,
  PostalCodeRequiredError,
  PostalCodeTooLongError,
  PostalCodeTooShortError,
  SexeRequiredError,
  UserTooYoungError,
} from "@domain/errors/user";
import { InvalidFirstnameError } from "@domain/errors/user/InvalidFirstnameError";
import { InvalidLastnameError } from "@domain/errors/user/InvalidLastnameError";
import { Email } from "@domain/values/Email";

type Props = {
  plainedPassword: string;
  email: string;
  confirmationUrl: string;
  sexe: string;
  dateOfBirth: string;
} & Required<
  Pick<UserEntity, "firstname" | "lastname" | "address" | "phoneNumber">
>;

export class RegisterUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService
  ) {}

  public async execute({
    firstname,
    lastname,
    email,
    plainedPassword,
    confirmationUrl,
    address,
    phoneNumber,
    dateOfBirth,
    sexe,
  }: Props): Promise<
    | UserToDTO
    | EmailInvalidFormatError
    | EmailAlreadyExistsError
    | UserNotFoundError
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
    | AddressRequiredError
    | AddressTooShortError
    | AddressTooLongError
    | AddressMissingNumberError
    | CityRequiredError
    | CityTooShortError
    | CityTooLongError
    | CityInvalidCharactersError
    | CountryRequiredError
    | CountryTooShortError
    | CountryTooLongError
    | CountryInvalidCharactersError
    | PostalCodeRequiredError
    | PostalCodeTooShortError
    | PostalCodeTooLongError
    | PostalCodeInvalidCharactersError
  > {
    const emailVO = Email.create(email);
    if (emailVO instanceof Error) return emailVO;

    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) return new EmailAlreadyExistsError(emailVO);

    const passwordHash = await this.encryptionService.hash(plainedPassword);

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();
    const date = new Date(dateOfBirth);
    const user = UserEntity.create({
      id,
      email: emailVO,
      firstname,
      lastname,
      passwordHash,
      createdAt,
      role: "client",
      phoneNumber,
      address,
      sexe,
      dateOfBirth: date,
    });

    if (user instanceof Error) return user;
    this.userRepository.save(user);

    const token = await this.tokenService.generateConfirmationToken({
      userId: user.id,
    });
    const confirmationLink = `${confirmationUrl}/confirm-email?token=${token}`;
    await this.emailService.sendConfirmationEmail(user.email, {
      firstname: user.firstname,
      confirmationLink,
    });
    return user.toDTO();
  }
}
