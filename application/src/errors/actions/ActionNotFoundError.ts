export class ActionNotFoundError extends Error {
  public readonly name = "ActionNotFoundError";
  public readonly statusCode = 404;

  constructor() {
    super(`Action not found`);
  }
}