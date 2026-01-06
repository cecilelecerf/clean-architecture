export class PhoneNumberRequiredError extends Error {
  public readonly statusCode = 422;

  constructor() {
    super("Phone number is required");
    this.name = "PhoneNumberRequiredError";
  }
}
