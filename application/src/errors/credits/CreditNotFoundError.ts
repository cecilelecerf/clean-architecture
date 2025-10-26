export class CreditNotFoundError extends Error {
  public readonly name = "CreditNotFoundError";

  constructor() {
    super(`Credit not found`);
  }
}
