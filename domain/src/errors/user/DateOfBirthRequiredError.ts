export class DateOfBirthRequiredError extends Error {
  public readonly statusCode = 422;

  constructor() {
    super("Date of birth is required");
    this.name = "DateOfBirthRequiredError";
  }
}
