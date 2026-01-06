export class DateOfBirthTooOldError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Date of birth is too old (maximum 150 years)");
    this.name = "DateOfBirthTooOldError";
  }
}
