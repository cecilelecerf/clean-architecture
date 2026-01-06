export class InvalidSexeError extends Error {
  public readonly statusCode = 400;

  constructor() {
    super("Invalid sexe value. Must be one of: girl, boy, other");
    this.name = "InvalidSexeError";
  }
}
