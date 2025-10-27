import { UserEntity } from "@domain/entities/UserEntity";

export class UserRoleMismatchError extends Error {
  public readonly name = "UserRoleMismatchError";
  public readonly statusCode = 403;

  constructor(
    public readonly expectedRoles: UserEntity["role"][],
    public readonly actualRole: UserEntity["role"]
  ) {
    super(
      `Expected role "${expectedRoles.join(", ")}", but got "${actualRole}"`
    );
  }
}
