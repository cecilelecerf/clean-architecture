export class AddressTooLongError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Address is too long (maximum 255 characters)");
    this.name = "AddressTooLongError";
  }
}
