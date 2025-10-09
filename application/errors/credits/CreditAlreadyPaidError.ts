export class CreditAlreadyPaidError extends Error {
  public readonly name = "CreditAlreadyPaidError";

  constructor(public readonly creditId: string) {
    super(`Le crédit avec l'id "${creditId}" est déjà entièrement remboursé.`);
  }
}
