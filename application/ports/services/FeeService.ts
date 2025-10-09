import { Money } from "@domain/values/Money";

export interface FeeService {
  /**
   * Calcule les frais pour une transaction donnée.
   * Peut dépendre du type d’opération ou du montant.
   */
  calculateFee(amount: Money): Promise<Money | Error>;
}
