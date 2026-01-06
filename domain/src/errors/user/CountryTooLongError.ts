export class CountryTooLongError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Country name is too long (maximum 100 characters)");
    this.name = "CountryTooLongError";
  }
}
