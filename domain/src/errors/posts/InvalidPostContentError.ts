export class InvalidPostContentError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super(
      "Le contenu du post est invalide : il doit faire entre 10 et 200 caractères."
    );
    this.name = "InvalidPostContentError";
  }
}
