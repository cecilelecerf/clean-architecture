import { ISIN } from "@domain/values/ISIN";

export class ActionNotAvailableError extends Error {
  public readonly name = "ActionNotAvailableError";
  public readonly statusCode = 400;

  constructor(public readonly isin: ISIN) {
    super(
      `L'action ${isin.getValue()} n'est pas disponible à l'achat actuellement`
    );
    Object.setPrototypeOf(this, ActionNotAvailableError.prototype);
  }
}
