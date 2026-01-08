export class InvalidLastnameError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly lastname: string) {
    super(
      `Invalid lastname: "${lastname}". Lastname must be between 2 and 50 characters.`
    );
    this.name = "InvalidLastnameError";
  }
}
