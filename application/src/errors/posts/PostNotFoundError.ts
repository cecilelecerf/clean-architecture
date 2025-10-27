export class PostNotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly name = "PostNotFoundError";

  constructor() {
    super(`Post not found`);
  }
}
