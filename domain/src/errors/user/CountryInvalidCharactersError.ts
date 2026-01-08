export class CountryInvalidCharactersError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Country name can only contain letters and spaces");
    this.name = "CountryInvalidCharactersError";
  }
}
