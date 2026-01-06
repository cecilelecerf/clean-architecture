export class InvalidCityError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Invalid city name. Must be between 2 and 100 characters and contain only letters, spaces, hyphens and apostrophes");
    this.name = "InvalidCityError";
  }
}
