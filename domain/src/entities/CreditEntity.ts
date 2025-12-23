import { Money } from "@domain/values/Money";
import { UserEntity } from "./UserEntity";
import { Percentage } from "@domain/values/Percentage";
import {
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMismatchError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import {
  CreditAlreadyPaidError,
  CreditStatusMismatchError,
  InvalidCreditDurationError,
} from "@domain/errors/credit";

export type MonthlySchedule = {
  capitalPaid: Money;
  month: number;
  before: Money;
  after: Money;
};

export enum CreditStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REFUSED = "REFUSED",
  COMPLETED = "COMPLETED",
}

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
    public status: CreditStatus,
    public createdAt: Date,
    public updatedAt: Date,
    public advisorId?: UserEntity["id"] | null
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
    status,
    createdAt,
    advisorId,
    updatedAt,
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
    | "status"
    | "createdAt"
    | "advisorId"
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
      status,
      createdAt,
      updatedAt,
      advisorId
    );
  }

  public static create({
    id,
    advisorId,
    userId,
    initialAmount,
    insuranceRate,
    interestRate,
    durationMonths,
    startDate,
    status,
    updatedAt,
    createdAt,
  }: Pick<
    CreditEntity,
    | "id"
    | "advisorId"
    | "userId"
    | "initialAmount"
    | "insuranceRate"
    | "interestRate"
    | "durationMonths"
    | "startDate"
    | "status"
    | "updatedAt"
    | "createdAt"
  >):
    | CreditEntity
    | InvalidCreditDurationError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    // Validation de la durée
    if (
      !Number.isInteger(durationMonths) ||
      durationMonths <= 0 ||
      durationMonths > 400
    ) {
      return new InvalidCreditDurationError(durationMonths);
    }

    const temp = new CreditEntity(
      id,
      userId,
      initialAmount,
      insuranceRate,
      interestRate,
      durationMonths,
      startDate,
      initialAmount,
      initialAmount,
      status,
      createdAt,
      updatedAt,
      advisorId
    );

    const monthlyPayment = temp.calculateMonthlyPayment();
    if (monthlyPayment instanceof Error) return monthlyPayment;

    temp.monthlyPayment = monthlyPayment;
    return temp;
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

  public assignAdvisor({
    advisorId,
    now,
  }: {
    advisorId: string;
    now: Date;
  }): void {
    this.advisorId = advisorId;
    this.updatedAt = now;
  }

  public accept({ now }: { now: Date }): void | CreditStatusMismatchError {
    if (this.status !== CreditStatus.PENDING) {
      return new CreditStatusMismatchError(this.status);
    }
    this.status = CreditStatus.ACCEPTED;
    this.updatedAt = now;
  }

  public refuse({ now }: { now: Date }): void | CreditStatusMismatchError {
    if (this.status !== CreditStatus.PENDING) {
      return new CreditStatusMismatchError(this.status);
    }
    this.status = CreditStatus.REFUSED;
    this.updatedAt = now;
  }

  public toDTO(): CreditDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      durationMonths: this.durationMonths,
      status: this.status,
      startDate: this.startDate,
      monthlyPayment: this.monthlyPayment,
      remainingBalance: this.remainingBalance,
      initialAmount: this.initialAmount,
      userId: this.id,
      interestRate: this.interestRate.value,
      insuranceRate: this.insuranceRate.value,
      updatedAt: this.updatedAt,
    };
  }
}

export type CreditDTO = { interestRate: number; insuranceRate: number } & Pick<
  CreditEntity,
  | "id"
  | "createdAt"
  | "durationMonths"
  | "status"
  | "startDate"
  | "monthlyPayment"
  | "remainingBalance"
  | "initialAmount"
  | "userId"
  | "updatedAt"
>;
