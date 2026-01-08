export class FormuleCreditAlreadyExistsError extends Error {
  public readonly name = "FormuleCreditAlreadyExistsError";
  public readonly statusCode = 409;

  constructor(public readonly label: string) {
    super(`The credit with the label "${label}" is already in use.`);
  }
}
