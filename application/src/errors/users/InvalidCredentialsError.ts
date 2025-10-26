export class InvalidCredentialsError extends Error {
  public readonly name = "InvalidCredentialsError";

  constructor() {
    super("Invalid credentials provided");
  }
}
