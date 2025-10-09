import { UserEntity } from "@domain/entities/UserEntity";

export class UserRoleMismatchError extends Error {
  public readonly name = "UserRoleMismatchError";

  constructor(
    public readonly expectedRoles: UserEntity["role"][],
    public readonly actualRole: string
  ) {
    super(
      `Expected role "${expectedRoles.join(", ")}", but got "${actualRole}"`
    );
  }
}
