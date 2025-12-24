export class SavingsRateNotFoundError extends Error {
  public readonly statusCode = 404;

  constructor(date?: Date) {
    super(
      date
        ? `Aucun taux d'épargne trouvé pour la date ${date.toLocaleDateString(
            "fr-FR"
          )}`
        : "Aucun taux d'épargne configuré"
    );
    this.name = "SavingsRateNotFoundError";
  }
}
