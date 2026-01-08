export class PostalCodeTooShortError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Postal code is too short (minimum 3 characters)");
    this.name = "PostalCodeTooShortError";
  }
}
