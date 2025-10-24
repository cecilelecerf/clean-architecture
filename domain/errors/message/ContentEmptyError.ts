export class ContentEmptyError extends Error {
  public readonly name = "ContentEmptyError";

  constructor() {
    super("Message content cannot be empty");
  }
}
