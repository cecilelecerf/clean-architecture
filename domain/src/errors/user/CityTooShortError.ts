export class CityTooShortError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("City name is too short (minimum 2 characters)");
    this.name = "CityTooShortError";
  }
}
