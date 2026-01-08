export class PostalCodeInvalidCharactersError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Postal code can only contain letters, numbers, spaces and hyphens");
    this.name = "PostalCodeInvalidCharactersError";
  }
}
