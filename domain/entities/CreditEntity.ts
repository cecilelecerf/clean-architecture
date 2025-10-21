import { Money } from "@domain/values/Money";
import { UserEntity } from "./UserEntity";
import { MoneyAmountNegativeError } from "@domain/errors/money/MoneyAmountNegativeError";
import { CreditAlreadyPaidError } from "@domain/errors/credit/CreditAlreadyPaidError";
import { Percentage } from "@domain/values/Percentage";
import { MoneyCurrencyMissingError } from "@domain/errors/money/MoneyCurrencyMissingError";
import { MoneyAmountInvalidError } from "@domain/errors/money/MoneyAmountInvalidError";

export class CreditEntity {
  private constructor(
    public id: string,
    public userId: UserEntity["id"],
    public initialAmount: Money,
    // ? taux d'interet annuel
    public interestRate: Percentage,
    // ? sur le tota;
    public insuranceRate: Percentage,
    public durationMonths: number,
    public startDate: Date,
    public monthlyPayment: Money,
    public remainingBalance: Money
  ) {}
  public static from({
    id,
    userId,
    initialAmount,
    insuranceRate,
    interestRate,
    startDate,
    monthlyPayment,
    durationMonths,
    remainingBalance,
  }: Pick<
    CreditEntity,
    | "id"
    | "userId"
    | "initialAmount"
    | "insuranceRate"
    | "interestRate"
    | "startDate"
    | "monthlyPayment"
    | "durationMonths"
    | "remainingBalance"
  >) {
    return new CreditEntity(
      id,
      userId,
      initialAmount,
      interestRate,
      insuranceRate,
      durationMonths,
      startDate,
      monthlyPayment,
      remainingBalance
    );
  }

  public calculateMonthlyPayment():
    | Money
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    const P = this.initialAmount.amount;
    const n = this.durationMonths;
    const r = this.interestRate.value / 12 / 100;
    const basePayment = (P * r) / (1 - Math.pow(1 + r, -n));
    const insurance = ((this.insuranceRate.value / 100) * P) / n;

    const paymentOrError = Money.create(
      basePayment + insurance,
      this.initialAmount.currency
    );
    if (paymentOrError instanceof Error) {
      return paymentOrError;
    }
    return paymentOrError;
  }

  /**
   * 💸 Effectue le paiement d’une mensualité.
   * Retourne soit le crédit mis à jour, soit une erreur métier.
   */
  // TODO : fixe Error
  public payMonthly():
    | CreditEntity
    | CreditAlreadyPaidError
    | MoneyAmountNegativeError
    | Error {
    if (this.isFullyPaid()) {
      return new CreditAlreadyPaidError(this.id);
    }

    const payment = this.calculateMonthlyPayment();
    if (payment instanceof Error) {
      return payment;
    }

    const newRemainingBalance = this.remainingBalance.subtract(payment);
    if (newRemainingBalance instanceof Error) {
      return newRemainingBalance;
    }

    this.remainingBalance = newRemainingBalance;
    return this;
  }

  public isFullyPaid(): boolean {
    return this.remainingBalance.amount <= 0;
  }

  // Retourne le capital restant
  public getRemainingBalance(): Money {
    return this.remainingBalance;
  }
}
