export class InvalidPostTitleError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super(
      "Le titre du post est invalide : il doit faire entre 10 et 100 caractères."
    );
    this.name = "InvalidPostTitleError";
  }
}
