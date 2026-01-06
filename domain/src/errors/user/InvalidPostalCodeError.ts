export class InvalidPostalCodeError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Invalid postal code. Must be between 3 and 10 characters");
    this.name = "InvalidPostalCodeError";
  }
}
