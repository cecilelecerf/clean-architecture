export class CountryTooShortError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Country name is too short (minimum 2 characters)");
    this.name = "CountryTooShortError";
  }
}
