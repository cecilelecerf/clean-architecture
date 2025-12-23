export class InvalidAccountTypSectioneError extends Error {
  public readonly statusCode = 400;

  constructor(type: string, validTypes: readonly string[]) {
    super(
      `Invalid account type "${type}". Must be one of: ${validTypes.join(", ")}`
    );
    this.name = "InvalidAccountTypeSectionError";
  }
}
