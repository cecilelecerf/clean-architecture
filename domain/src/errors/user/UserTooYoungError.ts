export class UserTooYoungError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("User must be at least 18 years old");
    this.name = "UserTooYoungError";
  }
}
