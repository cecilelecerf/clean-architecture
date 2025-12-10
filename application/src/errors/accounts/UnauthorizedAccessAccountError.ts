export class UnauthorizedAccessAccountError extends Error {
  public readonly statusCode = 404;
  public readonly name = "UnauthorizedAccessAccountError";

  constructor() {
    super(`You are not authorized to delete or update this account`);
  }
}
