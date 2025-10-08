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
  }: UserEntity) {
    return new UserEntity(
      id,
      firstname,
      lastname,
      email,
      passwordHash,
      role,
      isActiveField,
      createdAt,
      confirmedAt
    );
  }

  public isActive(): boolean {
    return this.isActiveField && !!this.confirmedAt;
  }

  public hasRole({ role }: Pick<UserEntity, "role">): boolean {
    return role === this.role;
  }
}
