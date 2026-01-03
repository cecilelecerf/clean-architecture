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
import { AccountEntity } from "./AccountEntity";
import { FormuleCreditEntity } from "./FormuleCreditEntity";

export type MonthlySchedule = {
  capitalPaid: Money;
  month: number;
  before: Money;
  after: Money;
};

export enum CreditStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED", // Crédit en cours de paiement
  REFUSED = "REFUSED",
  COMPLETED = "COMPLETED", // Crédit avec remboursement terminé
}

export class CreditEntity {
  private constructor(
    public id: string,
    public accountId: AccountEntity["iban"],
    // La formule du prêt choisie par le client et créé par le directeur de la banque
    public formuleCreditId: FormuleCreditEntity["id"],
    public initialAmount: Money,
    public durationMonths: number,
    public startDate: Date,
    public monthlyPayment: Money,
    public remainingBalance: Money,
    public status: CreditStatus,
    public createdAt: Date,
    public updatedAt: Date,
    public advisorId: UserEntity["id"] | null,
    // Raison du refus ou acceptation du conseiller
    public reason?: string | null
  ) {}

  public static from({
    id,
    accountId,
    formuleCreditId,
    initialAmount,
    startDate,
    monthlyPayment,
    durationMonths,
    remainingBalance,
    status,
    createdAt,
    updatedAt,
    advisorId,
    reason,
  }: Pick<
    CreditEntity,
    | "id"
    | "accountId"
    | "formuleCreditId"
    | "initialAmount"
    | "startDate"
    | "monthlyPayment"
    | "durationMonths"
    | "remainingBalance"
    | "status"
    | "createdAt"
    | "updatedAt"
    | "advisorId"
    | "reason"
  >) {
    return new CreditEntity(
      id,
      accountId,
      formuleCreditId,
      initialAmount,
      durationMonths,
      startDate,
      monthlyPayment,
      remainingBalance,
      status,
      createdAt,
      updatedAt,
      advisorId,
      reason
    );
  }

  public static create(
    {
      id,
      advisorId,
      accountId,
      formuleCreditId,
      initialAmount,
      durationMonths,
      startDate,
      status,
      createdAt,
      reason,
    }: Pick<
      CreditEntity,
      | "id"
      | "advisorId"
      | "accountId"
      | "formuleCreditId"
      | "initialAmount"
      | "durationMonths"
      | "startDate"
      | "status"
      | "createdAt"
      | "reason"
    >,
    interestRate: Percentage,
    insuranceRate: Percentage
  ):
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
      accountId,
      formuleCreditId,
      initialAmount,
      durationMonths,
      startDate,
      initialAmount,
      initialAmount,
      status,
      createdAt,
      createdAt,
      advisorId,
      reason
    );

    const monthlyPayment = temp.calculateMonthlyPayment(
      interestRate,
      insuranceRate
    );
    if (monthlyPayment instanceof Error) return monthlyPayment;

    temp.monthlyPayment = monthlyPayment;
    return temp;
  }

  /** Calcule la mensualité */
  public calculateMonthlyPayment(
    interestRate: Percentage,
    insuranceRate: Percentage
  ):
    | Money
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    const P = this.initialAmount.amount;
    const n = this.durationMonths;
    const r = interestRate.value / 12 / 100;
    const basePayment = (P * r) / (1 - Math.pow(1 + r, -n));
    const insurance = ((insuranceRate.value / 100) * P) / n;

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
  public payMonthly(
    interestRate: Percentage,
    insuranceRate: Percentage
  ):
    | CreditEntity
    | CreditAlreadyPaidError
    | MoneyCurrencyMissingError
    | MoneyCurrencyMismatchError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    if (this.isFullyPaid()) {
      return new CreditAlreadyPaidError(this.id);
    }

    const payment = this.calculateMonthlyPayment(interestRate, insuranceRate);
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
  public calculateAmortizationSchedule(
    interestRate: Percentage,
    insuranceRate: Percentage
  ):
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
      const payResult = simulated.payMonthly(interestRate, insuranceRate);
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
  }): CreditEntity {
    this.advisorId = advisorId;
    this.updatedAt = now;
    return this;
  }

  public accept({
    now,
    reason,
  }: {
    now: Date;
    reason?: string;
  }): CreditEntity | CreditStatusMismatchError {
    if (this.status !== CreditStatus.PENDING) {
      return new CreditStatusMismatchError(this.status);
    }
    this.status = CreditStatus.ACCEPTED;
    if (reason) this.reason = reason;
    this.updatedAt = now;
    return this;
  }

  public refuse({
    now,
    reason,
  }: {
    now: Date;
    reason?: string;
  }): CreditEntity | CreditStatusMismatchError {
    if (this.status !== CreditStatus.PENDING) {
      return new CreditStatusMismatchError(this.status);
    }
    this.status = CreditStatus.REFUSED;
    if (reason) this.reason = reason;
    this.updatedAt = now;
    return this;
  }

  public toDTO(): CreditDTO {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      durationMonths: this.durationMonths,
      status: this.status,
      startDate: this.startDate.toISOString(),
      monthlyPayment: this.monthlyPayment,
      remainingBalance: this.remainingBalance,
      initialAmount: this.initialAmount,
      accountId: this.accountId.value,
      formuleCreditId: this.formuleCreditId,
      updatedAt: this.updatedAt.toISOString(),
      advisorId: this.advisorId,
    };
  }
}

export type CreditDTO = {
  accountId: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
} & Pick<
  CreditEntity,
  | "id"
  | "durationMonths"
  | "status"
  | "monthlyPayment"
  | "remainingBalance"
  | "initialAmount"
  | "formuleCreditId"
  | "advisorId"
>;
