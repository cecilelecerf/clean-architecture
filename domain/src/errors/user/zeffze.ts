export class AddressMissingNumberError extends Error {
  constructor() {
    super("Address must contain at least one number (street number)");
    this.name = "AddressMissingNumberError";
  }
}
