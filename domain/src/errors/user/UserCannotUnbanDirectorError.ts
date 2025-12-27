export class UserCannotUnbanDirectorError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("A director cannot unban another director");
    this.name = "UserCannotUnbanDirectorError";
  }
}
