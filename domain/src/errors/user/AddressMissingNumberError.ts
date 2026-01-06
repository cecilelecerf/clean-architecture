export class AddressMissingNumberError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Address must contain at least one number (street number)");
    this.name = "AddressMissingNumberError";
  }
}
