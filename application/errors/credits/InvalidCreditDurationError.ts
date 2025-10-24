import { CreditEntity } from "@domain/entities/CreditEntity";

export class InvalidCreditDurationError extends Error {
  public readonly name = "InvalidCreditDurationError";

  constructor(public readonly durationMonths: CreditEntity["durationMonths"]) {
    super(
      `Le nombre de mois doit être un entier positif inférieur à 400. Valeur reçue : ${durationMonths}`
    );
  }
}
