export class CityTooLongError extends Error {
  constructor() {
    super("City name is too long (maximum 100 characters)");
    this.name = "CityTooLongError";
  }
}
