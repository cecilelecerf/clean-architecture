export class InvalidDateOfBirthError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Invalid date of birth. Must be a valid date in the past, and user must be at least 18 years old");
    this.name = "InvalidDateOfBirthError";
  }
}
