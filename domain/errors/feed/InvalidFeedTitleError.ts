export class InvalidFeedTitleError extends Error {
  constructor() {
    super(
      "Le titre du feed est invalide : il doit faire entre 10 et 100 caractères."
    );
    this.name = "InvalidFeedTitleError";
  }
}
