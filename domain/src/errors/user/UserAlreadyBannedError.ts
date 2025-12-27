export class UserAlreadyBannedError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly userId: string) {
    super(`User ${userId} is already banned`);
    this.name = "UserAlreadyBannedError";
  }
}
