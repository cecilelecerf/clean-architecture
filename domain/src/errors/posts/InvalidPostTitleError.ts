export class InvalidPostTitleError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly length?: number) {
    super(
      length !== undefined
        ? `Invalid post title length: ${length} characters. Title must be between 5 and 100 characters.`
        : "Invalid post title. Title must be between 5 and 100 characters."
    );
    this.name = "InvalidPostTitleError";
  }
}
