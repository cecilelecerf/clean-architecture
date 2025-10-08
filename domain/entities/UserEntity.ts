import { Email } from "@domain/values/Email";

export class UserEntity {
  private constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    public email: Email,
    public passwordHash: string,
    public role: "client" | "conseiller" | "directeur",
    private isActiveField: boolean,
    public createdAt: Date,
    public confirmedAt?: Date
  ) {}

  public static create(props: {
    firstname: string;
    lastname: string;
    email: Email;
    passwordHash: string;
    role: "client" | "conseiller" | "directeur";
  }): UserEntity {
    const now = new Date();
    return new UserEntity(
      crypto.randomUUID(),
      props.firstname,
      props.lastname,
      props.email,
      props.passwordHash,
      props.role,
      true,
      now
    );
  }

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
