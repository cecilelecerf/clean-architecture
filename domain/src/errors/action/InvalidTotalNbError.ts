export class InvalidTotalNbError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly totalNb: number) {
    super(
      `Invalid total number: ${totalNb}. Total number must be a positive integer.`
    );
    this.name = "InvalidTotalNbError";
  }
}
