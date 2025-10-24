export class InvalidPostContentError extends Error {
  constructor() {
    super(
      "Le contenu du post est invalide : il doit faire entre 10 et 200 caractères."
    );
    this.name = "InvalidPostContentError";
  }
}
