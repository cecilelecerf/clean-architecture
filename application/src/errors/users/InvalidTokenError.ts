export class InvalidTokenError extends Error {
  public readonly name = "InvalidTokenError";
  public readonly statusCode = 401;

  constructor() {
    super("Invalid token");
  }
}
