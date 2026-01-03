export class EffectiveDateInPastError extends Error {
  public readonly statusCode = 400;

  constructor(
    public readonly effectiveDate: Date,
    public readonly currentDate: Date
  ) {
    super(
      `Effective date (${effectiveDate.toISOString()}) must be in the future. Current date is ${currentDate.toISOString()}`
    );
    this.name = "EffectiveDateInPastError";
  }
}
