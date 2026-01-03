import { InvalidFormuleTypeError } from "@domain/errors/formuleType";
import { FormuleType } from "@domain/values/FormuleType";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export class FormuleCreditEntity {
  private constructor(
    public id: string,
    public interestRate: Percentage,
    public insuranceRate: Percentage,
    public type: FormuleType,
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
    type: typeStr,
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
  }): FormuleCreditEntity | InvalidFormuleTypeError {
    if (interestRate) this.interestRate = interestRate;
    if (insuranceRate) this.insuranceRate = insuranceRate;
    if (typeStr) {
      const formuleType = FormuleType.create(typeStr);
      if (formuleType instanceof Error) return formuleType;
      this.type = formuleType;
    }
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
    return this;
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
      type: this.type.value,
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
  minAmount?: number;
  maxAmount?: number;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  type: string;
} & Pick<
  FormuleCreditEntity,
  "id" | "label" | "isActive" | "description" | "currency"
>;
