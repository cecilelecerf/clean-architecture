export class UserEntity {
  private constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    // TODO : Add value object
    public email: string,
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
  }: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    passwordHash: string;
    role: "client" | "conseiller" | "directeur";
    isActive: boolean;
    confirmedAt?: Date;
    createdAt: Date;
  }) {
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
