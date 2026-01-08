export class InvalidPhoneNumberError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Invalid phone number format. Expected international format (e.g., +33612345678)");
    this.name = "InvalidPhoneNumberError";
  }
}
