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
    public confirmedAt?: Date,
    public modifiedAt?: Date
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
    modifiedAt,
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
    | "modifiedAt"
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
      confirmedAt,
      modifiedAt
    );
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
}

export type UserDTO = Pick<
  UserEntity,
  "id" | "email" | "firstname" | "lastname" | "role"
>;
