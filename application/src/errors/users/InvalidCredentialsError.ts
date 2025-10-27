export class InvalidCredentialsError extends Error {
  public readonly name = "InvalidCredentialsError";
  public readonly statusCode = 401;

  constructor() {
    super("Invalid credentials provided");
  }
}
