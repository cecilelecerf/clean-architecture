export class InvalidCreditDurationError extends Error {
  public readonly statusCode = 409;
  constructor(public readonly durationMonths: number) {
    super(`Le nombre de mois doit être un entier positif inférieur à 400. Valeur reçue : ${durationMonths}`);
    this.name = "InvalidCreditDurationError";
  }
}
