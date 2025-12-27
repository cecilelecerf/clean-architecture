export class UserCannotBanDirectorError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("A director cannot ban another director");
    this.name = "UserCannotBanDirectorError";
  }
}
