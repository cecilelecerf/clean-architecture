export class InvalidAccountTypeError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly type?: string) {
    super(
      type
        ? `Invalid account type: "${type}". Type must be "courant" or "epargne".`
        : "Invalid account type. Type must be 'courant' or 'epargne'."
    );
    this.name = "InvalidAccountTypeError";
  }
}
