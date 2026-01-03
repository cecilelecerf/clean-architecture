export class InvalidTitleError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly title: string, public readonly length?: number) {
    super(
      length !== undefined
        ? `Invalid thread title: "${title}" (${length} characters). Title must be between 3 and 100 characters.`
        : `Invalid thread title: "${title}". Title must be between 3 and 100 characters.`
    );
    this.name = "InvalidTitleError";
  }
}
