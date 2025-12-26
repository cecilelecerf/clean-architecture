export class InvalidActionNameError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly name: string) {
    super(
      `Invalid action name: "${name}". Name must be between 2 and 100 characters.`
    );
    this.name = "InvalidActionNameError";
  }
}
