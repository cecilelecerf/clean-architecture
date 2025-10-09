import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export interface CreditAmortizationService {
  /**
   * Calcule le plan d’amortissement d’un crédit à mensualité constante.
   *
   * @param principal - Capital emprunté
   * @param annualInterestRate - Taux d’intérêt annuel en pourcentage (ex: 5 pour 5%)
   * @param insuranceRate - Taux d’assurance annuel en pourcentage (facultatif)
   * @param months - Durée en mois
   * @returns Liste des mensualités avec détail de l’amortissement
   */
  calculateSchedule(
    principal: Money,
    annualInterestRate: Percentage,
    insuranceRate: Percentage,
    months: number
  ): Promise<AmortizationSchedule[] | Error>;
}

export interface AmortizationSchedule {
  month: number;
  payment: Money;
  interest: Money;
  principal: Money;
  insurance: Money;
  remainingBalance: Money;
}
