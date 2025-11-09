export class InvalidPaginationLimitError extends Error {
  public readonly statusCode = 400;

  constructor(limit: number) {
    super(
      `La limite de pagination (${limit}) est invalide. Elle doit être supérieure à 0.`
    );
    this.name = "InvalidPaginationLimitError";
  }
}
