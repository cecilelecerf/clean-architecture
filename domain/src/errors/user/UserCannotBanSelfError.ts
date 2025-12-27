export class UserCannotBanSelfError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("A user cannot ban themselves");
    this.name = "UserCannotBanSelfError";
  }
}
