export class BankInterestAccountNotFoundError extends Error {
  public readonly statusCode = 500;

  constructor() {
    super("Le compte bancaire pour les intérêts n'est pas configuré");
    this.name = "BankInterestAccountNotFoundError";
  }
}
