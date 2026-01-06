export class InvalidAddressError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Invalid address. Must be between 5 and 255 characters and contain at least one number");
    this.name = "InvalidAddressError";
  }
}
