export class FormuleCreditNotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly name = "FormuleCreditNotFoundError";

  constructor() {
    super(`Formule Credit not found`);
  }
}
