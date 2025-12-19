export class InvalidAccountOwnerError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super(
      "Un compte bancaire doit avoir un propriétaire"
    );
    this.name = "InvalidAccountOwnerError";
  }
}
