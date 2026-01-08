export class MissingOrInvalidNameError extends Error {
  public readonly statusCode = 404;
  public readonly name = "MissingOrInvalidNameError";

  constructor() {
    super(`Name is missing or the name is invalid to rename the account`);
  }
}
