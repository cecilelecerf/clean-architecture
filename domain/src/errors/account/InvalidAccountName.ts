export class InvalidAccountNameError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super(
      "Le nom du compte est invalide : il doit faire entre 10 et 100 caractères."
    );
    this.name = "InvalidAccountNameError";
  }
}
