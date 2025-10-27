export class EmailInvalidFormatError extends Error {
  statusCode = 400;
  public constructor(public readonly email: string) {
    super(`Invalid email format: ${email}`);
    this.name = "EmailInvalidFormatError";
  }
}
