import { CreditEntity } from "@domain/entities/CreditEntity";
export class CreditStatusMismatchError extends Error {
  public readonly statusCode = 409;
  public readonly name = "CreditStatusMismatchError";

  constructor(public readonly creditStatus: CreditEntity["status"]) {
    super(`Le crédit est avec le status "${creditStatus}" au lieu d'être en attente.`);
  }
}
