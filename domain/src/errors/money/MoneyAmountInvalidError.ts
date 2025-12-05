export class MoneyAmountInvalidError extends Error {
  public readonly statusCode = 400;
  public constructor(public readonly amount: unknown) {
    super(`Le montant doit être un nombre valide : ${amount}`);
    this.name = "MoneyAmountInvalidError";
  }
}
