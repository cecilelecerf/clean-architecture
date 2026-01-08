export class InvalidPostContentError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly length?: number) {
    super(
      length !== undefined
        ? `Invalid post content length: ${length} characters. Content must be between 10 and 5000 characters.`
        : "Invalid post content. Content must be between 10 and 5000 characters."
    );
    this.name = "InvalidPostContentError";
  }
}
