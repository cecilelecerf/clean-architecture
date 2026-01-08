export class CityTooLongError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("City name is too long (maximum 100 characters)");
    this.name = "CityTooLongError";
  }
}
