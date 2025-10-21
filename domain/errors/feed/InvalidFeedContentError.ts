export class InvalidFeedContentError extends Error {
  constructor() {
    super(
      "Le contenu du feed est invalide : il doit faire entre 10 et 200 caractères."
    );
    this.name = "InvalidFeedContentError";
  }
}
