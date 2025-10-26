export class PostNotFoundError extends Error {
  public readonly name = "PostNotFoundError";

  constructor() {
    super(`Post not found`);
  }
}
