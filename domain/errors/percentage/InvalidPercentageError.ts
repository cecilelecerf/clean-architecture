export class InvalidPercentageError extends Error {
  constructor(public readonly value: number) {
    super(`Invalid percentage: ${value}. Must be between 0 and 100.`);
    this.name = "InvalidPercentageError";
  }
}
