import { CreditEntity } from "@domain/entities/CreditEntity";

export class CreditNotBelongsToClientError extends Error {
  public readonly statusCode = 403;
  public readonly name = "CreditNotBelongsToClientError";

  constructor(
    public readonly creditId: CreditEntity["id"],
    public readonly clientId: string
  ) {
    super(`Le crédit ${creditId} n'appartient pas au client ${clientId}.`);
  }
}
