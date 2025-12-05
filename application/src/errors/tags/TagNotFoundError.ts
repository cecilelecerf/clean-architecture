export class TagNotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly name = "TagNotFoundError";

  constructor() {
    super(`Tag not found`);
  }
}
