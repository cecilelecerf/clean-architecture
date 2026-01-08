export class InvalidCountryError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Invalid country name. Must be between 2 and 100 characters and contain only letters and spaces");
    this.name = "InvalidCountryError";
  }
}
