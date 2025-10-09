import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export interface CreditAmortizationService {
  /**
   * Calcule le plan d’amortissement d’un crédit à mensualité constante.
   *
   * @param initialAmount - Capital emprunté
   * @param annualInterestRate - Taux d’intérêt annuel en pourcentage (ex: 5 pour 5%)
   * @param insuranceRate - Taux d’assurance annuel en pourcentage (facultatif)
   * @param durationMonths - Durée en mois
   * @returns Liste des mensualités avec détail de l’amortissement
   */
  calculateSchedule(
    initialAmount: Money,
    annualInterestRate: Percentage,
    insuranceRate: Percentage,
    durationMonths: number
  ): Promise<Money | Error>;
}
