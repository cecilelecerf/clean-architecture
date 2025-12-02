export class NoAdvisorFoundError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("Aucun conseiller actif n'a été trouvé pour ce client.");
    this.name = "NoAdvisorFoundError";
  }
}
