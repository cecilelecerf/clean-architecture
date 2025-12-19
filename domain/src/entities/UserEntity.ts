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

  public isActive(): boolean {
    return this.isActiveField && !!this.confirmedAt;
  }

  public ban(): void {
    this.isActiveField = false;
  }

  public hasRole({ role }: Pick<UserEntity, "role">): boolean {
    return role === this.role;
  }

  public toFront(): UserToFront {
    return {
      id: this.id,
      email: this.email.value,
      firstname: this.firstname,
      lastname: this.lastname,
      role: this.role,
    };
  }
}

export type UserToFront = { email: string } & Pick<
  UserEntity,
  "id" | "firstname" | "lastname" | "role"
>;
