export class InvalidTransactionLabelError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly label: string, public readonly length?: number) {
    super(
      length !== undefined
        ? `Invalid transaction label: "${label}" (${length} characters). Label must be between 2 and 100 characters.`
        : `Invalid transaction label. Label must be between 2 and 100 characters.`
    );
    this.name = "InvalidTransactionLabelError";
  }
}
