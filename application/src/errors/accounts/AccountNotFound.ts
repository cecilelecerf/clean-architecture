export class AccountNotFoundError extends Error {
  public readonly name = "AccountNotFoundError";
  public readonly statusCode = 404;

  constructor() {
    super(`Account not found`);
  }
}
