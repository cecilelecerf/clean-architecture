import { Email } from "@domain/values/Email";

export class UserEntity {
  private constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    public email: Email,
    public passwordHash: string,
    public role: "client" | "conseiller" | "directeur",
    public isActive: boolean,
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
    isActive,
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
      isActive,
      createdAt,
      confirmedAt
    );
  }
}
