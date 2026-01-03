import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export class FormuleCreditEntity {
  private constructor(
    public id: string,
    public interestRate: Percentage,
    public insuranceRate: Percentage,
    public type: string,
    public label: string,
    public description: string,
    public isActive: boolean,
    public accountId: IBAN,
    public createdAt: Date,
    public updatedAt: Date,
    public minAmount?: Money,
    public maxAmount?: Money,
    public currency?: string
  ) {}

  public static from({
    id,
    interestRate,
    insuranceRate,
    type,
    label,
    description,
    isActive,
    accountId,
    createdAt,
    minAmount,
    maxAmount,
    currency,
    updatedAt,
  }: Pick<
    FormuleCreditEntity,
    | "id"
    | "interestRate"
    | "insuranceRate"
    | "type"
    | "label"
    | "description"
    | "isActive"
    | "accountId"
    | "createdAt"
    | "minAmount"
    | "maxAmount"
    | "currency"
    | "updatedAt"
  >) {
    return new FormuleCreditEntity(
      id,
      interestRate,
      insuranceRate,
      type,
      label,
      description,
      isActive,
      accountId,
      createdAt,
      updatedAt,
      minAmount,
      maxAmount,
      currency
    );
  }

  public static create({
    id,
    interestRate,
    insuranceRate,
    type,
    label,
    description,
    accountId,
    createdAt,
    minAmount,
    maxAmount,
    currency,
  }: Pick<
    FormuleCreditEntity,
    | "id"
    | "interestRate"
    | "insuranceRate"
    | "type"
    | "label"
    | "description"
    | "accountId"
    | "createdAt"
    | "minAmount"
    | "maxAmount"
    | "currency"
  >) {
    return new FormuleCreditEntity(
      id,
      interestRate,
      insuranceRate,
      type,
      label,
      description,
      true,
      accountId,
      createdAt,
      createdAt,
      minAmount,
      maxAmount,
      currency
    );
  }

  update({
    interestRate,
    insuranceRate,
    type,
    isActive,
    label,
    description,
    accountId,
    minAmount,
    maxAmount,
    currency,
    now,
  }: {
    interestRate?: Percentage;
    insuranceRate?: Percentage;
    type?: string;
    isActive?: boolean;
    label?: string;
    description?: string;
    accountId?: IBAN;
    minAmount?: Money;
    maxAmount?: Money;
    currency?: string;
    now: Date;
  }) {
    if (interestRate) this.interestRate = interestRate;
    if (insuranceRate) this.insuranceRate = insuranceRate;
    if (type) this.type = type;
    if (isActive !== undefined) {
      isActive ? this.enable({ now }) : this.disable({ now });
    }
    if (label) this.label = label;
    if (description) this.description = description;
    if (accountId) this.accountId = accountId;
    if (minAmount) this.minAmount = minAmount;
    if (maxAmount) this.maxAmount = maxAmount;
    if (currency) this.currency = currency;
    this.updatedAt = now;
  }

  public enable({ now }: { now: Date }): this {
    this.isActive = true;
    this.updatedAt = now;
    return this;
  }

  public disable({ now }: { now: Date }): this {
    this.isActive = false;
    this.updatedAt = now;
    return this;
  }

  public toDTO(): FormuleCreditDTO {
    return {
      id: this.id,
      interestRate: this.interestRate.value,
      insuranceRate: this.insuranceRate.value,
      type: this.type,
      label: this.label,
      description: this.description,
      isActive: this.isActive,
      accountId: this.accountId.value,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      minAmount: this.minAmount?.amount,
      maxAmount: this.maxAmount?.amount,
      currency: this.currency,
    };
  }
}

export type FormuleCreditDTO = {
  interestRate: number;
  insuranceRate: number;
  label: string;
  description: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
} & Pick<FormuleCreditEntity, "id" | "type" | "isActive">;
