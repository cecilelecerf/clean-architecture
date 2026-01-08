export class InvalidFirstnameError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly firstname: string) {
    super(
      `Invalid firstname: "${firstname}". Firstname must be between 2 and 50 characters.`
    );
    this.name = "InvalidFirstnameError";
  }
}
