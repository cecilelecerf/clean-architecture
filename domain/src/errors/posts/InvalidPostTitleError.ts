export class InvalidPostTitleError extends Error {
  constructor() {
    super(
      "Le titre du post est invalide : il doit faire entre 10 et 100 caractères."
    );
    this.name = "InvalidPostTitleError";
  }
}
