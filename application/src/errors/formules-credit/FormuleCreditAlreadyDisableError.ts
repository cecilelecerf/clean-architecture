import { CreditEntity } from "@domain/entities/CreditEntity";
export class FormuleCreditAlreadyDisableError extends Error {
  public readonly statusCode = 409;
  public readonly name = "FormuleCreditAlreadyDisableError";

  constructor(public readonly creditId: CreditEntity["id"]) {
    super(`La formule du  crédit avec l'id "${creditId}" est déjà désactivé.`);
  }
}
