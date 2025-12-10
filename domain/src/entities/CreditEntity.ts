import { Money } from "@domain/values/Money";
import { UserEntity } from "./UserEntity"; 
import { Percentage } from "@domain/values/Percentage"; 
import { MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMismatchError, MoneyCurrencyMissingError } from "@domain/errors/money";
import { CreditAlreadyPaidError } from "@domain/errors/credit";
export type MonthlySchedule = {
  capitalPaid: Money;
  month: number;
  before: Money;
  after: Money;
};
export class CreditEntity {
  private constructor(
    public id: string,
    public userId: UserEntity["id"],
    public initialAmount: Money,
    // taux d'interet annuel
    public interestRate: Percentage,
    // taux assurance;
    public insuranceRate: Percentage,
    public durationMonths: number,
    public startDate: Date,
    public monthlyPayment: Money,
    public remainingBalance: Money,
    public createdAt: Date,
    public updatedAt?: Date
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
    createdAt,
    updatedAt
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
    | "createdAt"
    | "updatedAt"
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
      remainingBalance,
      createdAt,
      updatedAt
    );
  }

  /** Calcule la mensualité */
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

    const paymentOrError = Money.create({
      amount: basePayment + insurance,
      currency: this.initialAmount.currency,
    });
    if (paymentOrError instanceof Error) {
      return paymentOrError;
    }
    return paymentOrError;
  }

  /**
   * 💸 Effectue le paiement d’une mensualité.
   * Retourne soit le crédit mis à jour, soit une erreur métier.
   */
  public payMonthly():
    | CreditEntity
    | CreditAlreadyPaidError
    | MoneyCurrencyMissingError
    | MoneyCurrencyMismatchError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
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

  /** Retourne le capital restant */
  public getRemainingBalance(): Money {
    return this.remainingBalance;
  }

  /** Calcule le plan d’amortissement complet */
  public calculateAmortizationSchedule():
    | MonthlySchedule[]
    | MoneyCurrencyMissingError
    | CreditAlreadyPaidError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | MoneyCurrencyMismatchError {
    const schedule: MonthlySchedule[] = [];

    const simulated = CreditEntity.from({ ...this });

    for (let month = 1; month <= simulated.durationMonths; month++) {
      const before = simulated.getRemainingBalance();
      const payResult = simulated.payMonthly();
      if (payResult instanceof Error) return payResult;
      const after = simulated.getRemainingBalance();

      const capitalPaid = before.subtract(after);
      if (capitalPaid instanceof Error) return capitalPaid;

      schedule.push({ month, before, after, capitalPaid });
    }

    return schedule;
  }
}
