export class ActionNotAvailableError extends Error {
  public readonly name = "ActionNotAvailableError";
  public readonly statusCode = 400;

  constructor(public readonly isin: string) {
    super(`L'action ${isin} n'est pas disponible à l'achat actuellement`);
    Object.setPrototypeOf(this, ActionNotAvailableError.prototype);
  }
}
