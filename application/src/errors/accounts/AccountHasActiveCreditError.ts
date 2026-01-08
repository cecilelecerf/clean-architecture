export class AccountHasActiveCreditError extends Error {
  public readonly statusCode = 404;
  public readonly name = "AccountHasActiveCreditError";
  constructor() {
    super("Cannot delete account with active credits");
  }
}
