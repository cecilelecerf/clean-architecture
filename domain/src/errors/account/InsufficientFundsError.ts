import { Money } from "@domain/values/Money";

export class InsufficientFundsError extends Error {
  public readonly name = "InsufficientFundsError";
  public readonly statusCode = 400;

  constructor(
    public readonly available: Money,
    public readonly required: Money
  ) {
    super(
      `Fonds insuffisants. Disponible: ${available.amount} ${available.currency}, Requis: ${required.amount} ${required.currency}`
    );
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}
