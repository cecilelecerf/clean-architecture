export class UserNotBannedError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly userId: string) {
    super(`User ${userId} is not banned`);
    this.name = "UserNotBannedError";
  }
}
