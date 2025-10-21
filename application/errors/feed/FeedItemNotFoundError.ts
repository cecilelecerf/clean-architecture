export class FeedItemNotFoundError extends Error {
  public readonly name = "FeedItemNotFoundError";

  constructor() {
    super(`Feed Item not found`);
  }
}
