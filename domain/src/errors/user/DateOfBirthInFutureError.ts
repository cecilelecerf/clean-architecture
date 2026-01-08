export class DateOfBirthInFutureError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Date of birth cannot be in the future");
    this.name = "DateOfBirthInFutureError";
  }
}
