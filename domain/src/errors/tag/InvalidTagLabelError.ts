export class InvalidTagLabelError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly label: string, public readonly length?: number) {
    super(
      length !== undefined
        ? `Invalid tag label: "${label}" (${length} characters). Label must be between 2 and 50 characters.`
        : `Invalid tag label: "${label}". Label must be between 2 and 50 characters.`
    );
    this.name = "InvalidTagLabelError";
  }
}
