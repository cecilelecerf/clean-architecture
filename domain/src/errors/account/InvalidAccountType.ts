export class InvalidAccountTypeError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super(
      "Le compte doit être un compte épargne our toucher des interêt"
    );
    this.name = "InvalidAccountTypeError";
  }
}
