export class ContentEmptyError extends Error {
  public readonly statusCode = 400;
  public readonly name = "ContentEmptyError";
  constructor() {
    super("Message content cannot be empty");
  }
}
