export class ContentTooLongError extends Error {
  public readonly statusCode = 400;

  constructor(
    public readonly length: number,
    public readonly maxLength: number = 5000
  ) {
    super(
      `Message content is too long (${length} characters). Maximum allowed is ${maxLength} characters.`
    );
    this.name = "ContentTooLongError";
  }
}
