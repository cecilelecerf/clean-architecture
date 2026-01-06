export class CountryRequiredError extends Error {
  public readonly statusCode = 422;

  constructor() {
    super("Country is required");
    this.name = "CountryRequiredError";
  }
}
