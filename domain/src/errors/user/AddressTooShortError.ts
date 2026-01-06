export class AddressTooShortError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Address is too short (minimum 5 characters)");
    this.name = "AddressTooShortError";
  }
}
