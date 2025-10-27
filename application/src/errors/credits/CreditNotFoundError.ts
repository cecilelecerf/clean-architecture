export class CreditNotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly name = "CreditNotFoundError";

  constructor() {
    super(`Credit not found`);
  }
}
