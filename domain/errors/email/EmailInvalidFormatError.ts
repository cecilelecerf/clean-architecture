export class EmailInvalidFormatError extends Error {
  public constructor(public readonly email: string) {
    super(`Invalid email format: ${email}`);
    this.name = "EmailInvalidFormatError";
  }
}
