import {
  InvalidLastnameError,
  UserAlreadyBannedError,
  UserCannotBanDirectorError,
  UserCannotBanSelfError,
  UserNotBannedError,
} from "@domain/errors/user";
import { InvalidFirstnameError } from "@domain/errors/user/InvalidFirstnameError";
import { UserCannotUnbanDirectorError } from "@domain/errors/user/UserCannotUnbanDirectorError";
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
  public update({
    firstname,
    lastname,
    email,
    now,
  }: {
    firstname?: string;
    lastname?: string;
    email?: Email;
    now: Date;
  }): UserEntity | InvalidFirstnameError | InvalidLastnameError {
    if (firstname) {
      const firstnameStr = UserEntity.validateFirstname(firstname);
      if (firstnameStr instanceof Error) return firstnameStr;
      this.firstname = firstnameStr;
    }

    if (lastname) {
      const lastnameStr = UserEntity.validateLastname(lastname);
      if (lastnameStr instanceof Error) return lastnameStr;
      this.lastname = lastnameStr;
    }

    if (email !== undefined) {
      this.email = email;
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
    };
  }
  public toMe(): UserToMe {
    return {
      ...this.toDTO(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export type UserToDTO = { email: string; confirmedAt?: string } & Pick<
  UserEntity,
  "id" | "firstname" | "lastname" | "role" | "isActiveField"
>;

export type UserToMe = UserToDTO & { createdAt: string; updatedAt: string };
