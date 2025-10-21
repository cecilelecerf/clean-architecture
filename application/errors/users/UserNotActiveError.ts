import { UserEntity } from "@domain/entities/UserEntity";

export class UserNotActiveError extends Error {
  public readonly name = "UserNotActiveError";

  constructor(public readonly userId: UserEntity["id"]) {
    super(`User: ${userId}  not active`);
  }
}
