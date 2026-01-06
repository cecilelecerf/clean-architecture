export class PostalCodeRequiredError extends Error {
  public readonly statusCode = 422;

  constructor() {
    super("Postal code is required");
    this.name = "PostalCodeRequiredError";
  }
}
