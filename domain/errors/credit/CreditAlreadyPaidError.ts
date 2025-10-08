export class CreditAlreadyPaidError extends Error {
  constructor(public readonly creditId: string) {
    super(`Credit ${creditId} is already fully paid.`);
    this.name = "CreditAlreadyPaidError";
  }
}
