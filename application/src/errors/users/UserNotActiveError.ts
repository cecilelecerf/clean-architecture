import { UserEntity } from "@domain/entities/UserEntity";

export class UserNotActiveError extends Error {
  public readonly name = "UserNotActiveError";
  public readonly statusCode = 403;

  constructor(public readonly userId: UserEntity["id"]) {
    super(`User: ${userId}  not active`);
  }
}
