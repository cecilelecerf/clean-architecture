export class MissingIBANError extends Error {
  public readonly statusCode = 404;
  public readonly name = "MissingIBANError";

  constructor() {
    super(`IBAN is missing to rename the account`);
  }
}
