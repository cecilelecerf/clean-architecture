import { InvalidLastnameError } from "@domain/errors/user";
import { InvalidFirstnameError } from "@domain/errors/user/InvalidFirstnameError";
import { Email } from "@domain/values/Email";

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
  >): UserEntity | InvalidFirstnameError | InvalidLastnameError {
    const firstnameStr = this.validateFirstname(firstname);
    if (firstnameStr instanceof Error) return firstnameStr;
    const lastnameStr = this.validateLastname(lastname);
    if (lastnameStr instanceof Error) return lastnameStr;
    return new UserEntity(
      id,
      firstnameStr,
      lastnameStr,
      email,
      passwordHash,
      role,
      true,
      createdAt,
      createdAt
    );
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

  public ban(): void {
    this.isActiveField = false;
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
    };
  }
}

export type UserToDTO = { email: string; confirmedAt?: string } & Pick<
  UserEntity,
  "id" | "firstname" | "lastname" | "role" | "isActiveField"
>;
