import { CreditEntity } from "@domain/entities/CreditEntity";

export class CreditAlreadyPaidError extends Error {
  public readonly name = "CreditAlreadyPaidError";

  constructor(public readonly creditId: CreditEntity["id"]) {
    super(`Le crédit avec l'id "${creditId}" est déjà entièrement remboursé.`);
  }
}
