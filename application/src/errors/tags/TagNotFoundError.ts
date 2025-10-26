export class TagNotFoundError extends Error {
  public readonly name = "TagNotFoundError";

  constructor() {
    super(`Tag not found`);
  }
}
