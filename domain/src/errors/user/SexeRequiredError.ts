export class SexeRequiredError extends Error {
  public readonly statusCode = 422;

  constructor() {
    super("Sexe is required");
    this.name = "SexeRequiredError";
  }
}
