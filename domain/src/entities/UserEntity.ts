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
import { UserAlreadyBannedError } from "@domain/errors/user/UserAlreadyBannedError";
import { UserCannotBanDirectorError } from "@domain/errors/user/UserCannotBanDirectorError";
import { UserCannotBanSelfError } from "@domain/errors/user/UserCannotBanSelfError";
import { UserCannotUnbanDirectorError } from "@domain/errors/user/UserCannotUnbanDirectorError";
import { UserNotBannedError } from "@domain/errors/user/UserNotBannedError";
import { Email } from "@domain/values/Email";

export type Address = {
  city: string;
  country: string;
  address: string;
  postalCode: string;
};

export class UserEntity {
  private constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    public email: Email,
    public passwordHash: string,
    public role: "client" | "conseiller" | "directeur",
    public isActiveField: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public phoneNumber?: string,
    public sexe?: "girl" | "boy" | "other",
    public address?: Address,
    public dateOfBirth?: Date,
    public confirmedAt?: Date
  ) {}

  public static from({
    id,
    firstname,
    lastname,
    email,
    passwordHash,
    role,
    isActiveField,
    confirmedAt,
    createdAt,
    updatedAt,
    phoneNumber,
    address,
    dateOfBirth,
    sexe,
  }: Pick<
    UserEntity,
    | "id"
    | "email"
    | "firstname"
    | "lastname"
    | "passwordHash"
    | "role"
    | "confirmedAt"
    | "createdAt"
    | "isActiveField"
    | "updatedAt"
    | "address"
    | "dateOfBirth"
    | "phoneNumber"
    | "sexe"
  >) {
    return new UserEntity(
      id,
      firstname,
      lastname,
      email,
      passwordHash,
      role,
      isActiveField,
      createdAt,
      updatedAt,
      phoneNumber,
      sexe,
      address,
      dateOfBirth,
      confirmedAt
    );
  }

  public static create({
    id,
    firstname,
    lastname,
    email,
    passwordHash,
    role,
    createdAt,
    phoneNumber,
    dateOfBirth,
    address,
    sexe,
  }: Pick<
    UserEntity,
    | "id"
    | "email"
    | "firstname"
    | "lastname"
    | "passwordHash"
    | "role"
    | "confirmedAt"
    | "createdAt"
    | "address"
    | "dateOfBirth"
    | "phoneNumber"
  > & { sexe?: string }):
    | UserEntity
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
    | PostalCodeInvalidCharactersError {
    const firstnameStr = this.validateFirstname(firstname);
    if (firstnameStr instanceof Error) return firstnameStr;
    const lastnameStr = this.validateLastname(lastname);
    if (lastnameStr instanceof Error) return lastnameStr;
    let mobile: string | undefined;
    let dob: Date | undefined;
    let validatedAddress: Address | undefined;
    let validatedSexe: "girl" | "boy" | "other" | undefined;
    if (role === "client") {
      const tmpPhone = this.validatePhone(phoneNumber);
      if (tmpPhone instanceof Error) return tmpPhone;
      mobile = tmpPhone;

      const tmpValidatedSexe = sexe ? this.validateSexe(sexe) : undefined;
      if (tmpValidatedSexe instanceof Error) return tmpValidatedSexe;
      validatedSexe = tmpValidatedSexe;

      const tmpDob = dateOfBirth
        ? this.validateDateOfBirth(dateOfBirth)
        : undefined;
      if (tmpDob instanceof Error) return tmpDob;
      dob = tmpDob;

      let tmpValidatedAddress: Address | undefined;
      const addr = this.validateAddress(address?.address);
      if (addr instanceof Error) return addr;

      const c = this.validateCity(address?.city);
      if (c instanceof Error) return c;

      const ctr = this.validateCountry(address?.country);
      if (ctr instanceof Error) return ctr;

      const pc = this.validatePostalCode(address?.postalCode);
      if (pc instanceof Error) return pc;

      tmpValidatedAddress = {
        address: addr!,
        city: c!,
        country: ctr!,
        postalCode: pc!,
      };

      validatedAddress = tmpValidatedAddress;
    }
    return new UserEntity(
      id,
      firstnameStr,
      lastnameStr,
      email,
      passwordHash,
      role,
      true,
      createdAt,
      createdAt,
      phoneNumber,
      validatedSexe,
      validatedAddress,
      dateOfBirth
    );
  }
  public update({
    firstname,
    lastname,
    email,
    phoneNumber,
    sexe,
    dateOfBirth,
    address,
    now,
  }: {
    firstname?: string;
    lastname?: string;
    email?: Email;
    phoneNumber?: string;
    sexe?: string;
    dateOfBirth?: Date | string;
    address?: Partial<Address>;
    now: Date;
  }) {
    console.log(sexe);
    if (firstname !== undefined) {
      const v = UserEntity.validateFirstname(firstname);
      if (v instanceof Error) return v;
      this.firstname = v;
    }

    if (lastname !== undefined) {
      const v = UserEntity.validateLastname(lastname);
      if (v instanceof Error) return v;
      this.lastname = v;
    }

    if (email !== undefined) {
      this.email = email;
    }

    if (this.role === "client") {
      if (phoneNumber !== undefined) {
        const v = UserEntity.validatePhone(phoneNumber);
        if (v instanceof Error) return v;
        this.phoneNumber = v;
      }

      if (sexe !== undefined) {
        const v = UserEntity.validateSexe(sexe);
        if (v instanceof Error) return v;
        this.sexe = v;
      }

      if (dateOfBirth !== undefined) {
        const v = UserEntity.validateDateOfBirth(dateOfBirth);
        if (v instanceof Error) return v;
        this.dateOfBirth = v;
      }

      if (address !== undefined) {
        const addr = UserEntity.validateAddress(address.address);
        if (addr instanceof Error) return addr;

        const city = UserEntity.validateCity(address.city);
        if (city instanceof Error) return city;

        const country = UserEntity.validateCountry(address.country);
        if (country instanceof Error) return country;

        const pc = UserEntity.validatePostalCode(address.postalCode);
        if (pc instanceof Error) return pc;

        this.address = {
          address: addr,
          city,
          country,
          postalCode: pc,
        };
      }
    }

    this.updatedAt = now;
    return this;
  }
  private static validateFirstname(
    firstname: string
  ): string | InvalidFirstnameError {
    const trimmed = firstname.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      return new InvalidFirstnameError(firstname);
    }
    return trimmed;
  }

  private static validateLastname(
    lastname: string
  ): string | InvalidLastnameError {
    const trimmed = lastname.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      return new InvalidLastnameError(lastname);
    }
    return trimmed;
  }
  public isActive(): boolean {
    return this.isActiveField && !!this.confirmedAt;
  }

  public ban(
    actorId: UserEntity["id"],
    now: Date
  ):
    | void
    | UserCannotBanDirectorError
    | UserAlreadyBannedError
    | UserCannotBanSelfError {
    if (actorId === this.id) {
      return new UserCannotBanSelfError();
    }
    if (!this.isActiveField) {
      return new UserAlreadyBannedError(this.id);
    }
    if (this.hasRole({ role: "directeur" })) {
      return new UserCannotBanDirectorError();
    }
    this.updatedAt = now;
    this.isActiveField = false;
  }

  public unban(
    now: Date
  ): void | UserNotBannedError | UserCannotUnbanDirectorError {
    if (this.isActiveField) {
      return new UserNotBannedError(this.id);
    }
    if (this.hasRole({ role: "directeur" })) {
      return new UserCannotUnbanDirectorError();
    }
    this.updatedAt = now;
    this.isActiveField = true;
  }

  public hasRole({ role }: Pick<UserEntity, "role">): boolean {
    return role === this.role;
  }

  public toDTO(): UserToDTO {
    return {
      id: this.id,
      email: this.email.value,
      firstname: this.firstname,
      lastname: this.lastname,
      role: this.role,
      confirmedAt: this.confirmedAt?.toISOString(),
      isActiveField: this.isActiveField,
      dateOfBirth: this.dateOfBirth?.toISOString(),
      phoneNumber: this.phoneNumber,
      address: this.address,
      sexe: this.sexe,
    };
  }
  public toMe(): UserToMe {
    return {
      ...this.toDTO(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
  private static validatePhone(
    phone: string | undefined
  ): string | PhoneNumberRequiredError | InvalidPhoneNumberError {
    if (!phone) return new PhoneNumberRequiredError();

    const trimmed = phone.trim();
    const cleaned = trimmed.replace(/[\s\-\(\)]/g, "");
    const phoneRegex = /^(\+\d{1,3})?\d{7,15}$/;

    if (!phoneRegex.test(cleaned)) {
      return new InvalidPhoneNumberError();
    }

    return cleaned;
  }

  /**
   * Valide le sexe/genre
   */
  private static validateSexe(
    sexe: string | undefined
  ): "girl" | "boy" | "other" | SexeRequiredError | InvalidSexeError {
    if (!sexe) return new SexeRequiredError();

    const normalized = sexe.trim().toLowerCase();
    const validValues = ["girl", "boy", "other"];

    if (!validValues.includes(normalized)) {
      return new InvalidSexeError();
    }

    return normalized as "girl" | "boy" | "other";
  }

  /**
   * Valide la date de naissance
   */
  private static validateDateOfBirth(
    date: Date | string | undefined
  ):
    | Date
    | DateOfBirthRequiredError
    | InvalidDateOfBirthError
    | DateOfBirthInFutureError
    | DateOfBirthTooOldError
    | UserTooYoungError {
    if (!date) return new DateOfBirthRequiredError();

    const parsedDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
      return new InvalidDateOfBirthError();
    }

    const now = new Date();
    const minDate = new Date(
      now.getFullYear() - 150,
      now.getMonth(),
      now.getDate()
    );

    if (parsedDate > now) {
      return new DateOfBirthInFutureError();
    }

    if (parsedDate < minDate) {
      return new DateOfBirthTooOldError();
    }

    const minAgeDate = new Date(
      now.getFullYear() - 18,
      now.getMonth(),
      now.getDate()
    );
    if (parsedDate > minAgeDate) {
      return new UserTooYoungError();
    }

    return parsedDate;
  }

  /**
   * Valide une adresse
   */
  private static validateAddress(
    address: string | undefined
  ):
    | string
    | AddressRequiredError
    | AddressTooShortError
    | AddressTooLongError
    | AddressMissingNumberError {
    if (!address) return new AddressRequiredError();

    const trimmed = address.trim();

    if (trimmed.length < 5) {
      return new AddressTooShortError();
    }

    if (trimmed.length > 255) {
      return new AddressTooLongError();
    }

    if (!/\d/.test(trimmed)) {
      return new AddressMissingNumberError();
    }

    return trimmed;
  }

  /**
   * Valide une ville
   */
  private static validateCity(
    city: string | undefined
  ):
    | string
    | CityRequiredError
    | CityTooShortError
    | CityTooLongError
    | CityInvalidCharactersError {
    if (!city) return new CityRequiredError();

    const trimmed = city.trim();

    if (trimmed.length < 2) {
      return new CityTooShortError();
    }

    if (trimmed.length > 100) {
      return new CityTooLongError();
    }

    const cityRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!cityRegex.test(trimmed)) {
      return new CityInvalidCharactersError();
    }

    const capitalized = trimmed
      .split(/[\s\-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(trimmed.includes("-") ? "-" : " ");

    return capitalized;
  }

  /**
   * Valide un pays
   */
  private static validateCountry(
    country: string | undefined
  ):
    | string
    | CountryRequiredError
    | CountryTooShortError
    | CountryTooLongError
    | CountryInvalidCharactersError {
    if (!country) return new CountryRequiredError();

    const trimmed = country.trim();

    if (trimmed.length < 2) {
      return new CountryTooShortError();
    }

    if (trimmed.length > 100) {
      return new CountryTooLongError();
    }

    const countryRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!countryRegex.test(trimmed)) {
      return new CountryInvalidCharactersError();
    }

    const capitalized = trimmed
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    return capitalized;
  }

  /**
   * Valide un code postal
   */
  private static validatePostalCode(
    postalCode: string | undefined
  ):
    | string
    | PostalCodeRequiredError
    | PostalCodeTooShortError
    | PostalCodeTooLongError
    | PostalCodeInvalidCharactersError {
    if (!postalCode) return new PostalCodeRequiredError();

    const trimmed = postalCode.trim().toUpperCase();

    if (trimmed.length < 3) {
      return new PostalCodeTooShortError();
    }

    if (trimmed.length > 10) {
      return new PostalCodeTooLongError();
    }

    const postalCodeRegex = /^[A-Z0-9\s\-]{3,10}$/;
    if (!postalCodeRegex.test(trimmed)) {
      return new PostalCodeInvalidCharactersError();
    }

    return trimmed;
  }

  public static isUserRole(role: string): role is UserEntity["role"] {
    return ["client", "conseiller", "directeur"].includes(role);
  }
}

export type UserToDTO = {
  email: string;
  confirmedAt?: string;
  dateOfBirth?: string;
} & Pick<
  UserEntity,
  | "id"
  | "firstname"
  | "lastname"
  | "role"
  | "isActiveField"
  | "address"
  | "sexe"
  | "phoneNumber"
>;

export type UserToMe = UserToDTO & { createdAt: string; updatedAt: string };
