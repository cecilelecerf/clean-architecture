export class MoneyAmountNegativeError extends Error {
  public constructor(public readonly amount: number) {
    super(`Le montant ne peut pas être négatif : ${amount}`);
    this.name = "MoneyAmountNegativeError";
  }
}