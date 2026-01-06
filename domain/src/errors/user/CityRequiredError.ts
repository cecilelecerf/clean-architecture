export class CityRequiredError extends Error {
  public readonly statusCode = 422;

  constructor() {
    super("City is required");
    this.name = "CityRequiredError";
  }
}
