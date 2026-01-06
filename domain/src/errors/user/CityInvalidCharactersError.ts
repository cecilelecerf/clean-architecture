export class CityInvalidCharactersError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("City name can only contain letters, spaces, hyphens and apostrophes");
    this.name = "CityInvalidCharactersError";
  }
}
