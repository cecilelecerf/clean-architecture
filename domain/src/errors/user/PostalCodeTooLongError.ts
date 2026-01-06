export class PostalCodeTooLongError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Postal code is too long (maximum 10 characters)");
    this.name = "PostalCodeTooLongError";
  }
}
