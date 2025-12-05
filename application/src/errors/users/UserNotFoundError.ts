export class UserNotFoundError extends Error {
  public readonly name = "UserNotFoundError";
  public readonly statusCode = 404;

  constructor() {
    super(`User not found`);
  }
}
