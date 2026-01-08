export class AddressRequiredError extends Error {
  public readonly statusCode = 422;

  constructor() {
    super("Address is required");
    this.name = "AddressRequiredError";
  }
}
