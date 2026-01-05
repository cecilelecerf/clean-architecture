import { Money } from "@domain/values/Money";
import { ActionEntity } from "./ActionEntity";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMismatchError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import {
  InvalidOrderStatusTransitionError,
  InvalidOrderTypeError,
  InvalidQuantityError,
} from "@domain/errors/order";
import { TransactionEntity } from "./TransactionEntity";
import { AccountEntity } from "./AccountEntity";

export class OrderEntity {
  private constructor(
    public id: string,
    public accountIban: AccountEntity["iban"],
    public actionId: ActionEntity["ISIN"],
    public type: "buy" | "sell",
    public quantity: number,
    public price: Money,
    public fee: Money,
    public status: "pending" | "executed" | "cancelled",
    public createdAt: Date,
    public updatedAt: Date,
    public date?: Date,
    public transactionId?: TransactionEntity["id"],
    public limitPrice?: Money,
    public scheduledFor?: Date
  ) {}

  private static validateQuantity(
    quantity: number
  ): number | InvalidQuantityError {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return new InvalidQuantityError(quantity);
    }
    return quantity;
  }

  private static validateType(
    type: string
  ): "buy" | "sell" | InvalidOrderTypeError {
    if (type !== "buy" && type !== "sell") {
      return new InvalidOrderTypeError(type);
    }
    return type;
  }

  private static calculateFee(
    price: Money,
    quantity: number
  ):
    | Money
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    const feeRate = 0.01;
    const totalPrice = price.multiply(quantity);
    if (totalPrice instanceof Error) return totalPrice;

    const fee = totalPrice.multiply(feeRate);
    if (fee instanceof Error) return fee;

    return fee;
  }

  public static create({
    id,
    accountIban,
    actionId,
    type,
    quantity,
    price,
    date,
    createdAt,
    transactionId,
    limitPrice,
    scheduledFor,
  }: Pick<
    OrderEntity,
    | "id"
    | "accountIban"
    | "actionId"
    | "type"
    | "quantity"
    | "price"
    | "date"
    | "createdAt"
    | "transactionId"
    | "limitPrice"
    | "scheduledFor"
  >):
    | OrderEntity
    | InvalidQuantityError
    | InvalidOrderTypeError
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    const validatedQuantity = this.validateQuantity(quantity);
    if (validatedQuantity instanceof Error) return validatedQuantity;

    const validatedType = this.validateType(type);
    if (validatedType instanceof Error) return validatedType;

    const fee = this.calculateFee(price, validatedQuantity);
    if (fee instanceof Error) return fee;

    return new OrderEntity(
      id,
      accountIban,
      actionId,
      validatedType,
      validatedQuantity,
      price,
      fee,
      "pending",
      createdAt,
      createdAt,
      date,
      transactionId,
      limitPrice,
      scheduledFor
    );
  }

  public static from({
    id,
    accountIban,
    actionId,
    type,
    quantity,
    price,
    fee,
    date,
    status,
    createdAt,
    updatedAt,
    transactionId,
    limitPrice,
    scheduledFor,
  }: Pick<
    OrderEntity,
    | "id"
    | "accountIban"
    | "actionId"
    | "type"
    | "quantity"
    | "price"
    | "fee"
    | "date"
    | "status"
    | "createdAt"
    | "updatedAt"
    | "transactionId"
    | "limitPrice"
    | "scheduledFor"
  >) {
    return new OrderEntity(
      id,
      accountIban,
      actionId,
      type,
      quantity,
      price,
      fee,
      status,
      createdAt,
      updatedAt,
      date,
      transactionId,
      limitPrice,
      scheduledFor
    );
  }

  public getTotal():
    | Money
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
    | MoneyCurrencyMismatchError {
    const totalPrice = this.price.multiply(this.quantity);
    if (totalPrice instanceof Error) {
      return totalPrice;
    }
    return totalPrice.add(this.fee);
  }

  public canBeExecuted({
    now,
    action,
  }: {
    action: ActionEntity;
    now: Date;
  }): boolean {
    if (!action.isAvailable) return false;

    if (this.scheduledFor && this.scheduledFor > now) {
      return false;
    }
    if (this.limitPrice) {
      if (this.type === "buy") {
        return action.currentPrice.amount <= this.limitPrice.amount;
      } else {
        return action.currentPrice.amount >= this.limitPrice.amount;
      }
    }
    return true;
  }

  public markExecuted({
    transactionId,
    now,
    price,
  }: {
    transactionId: TransactionEntity["id"];
    now: Date;
    price?: Money;
  }): OrderEntity | InvalidOrderStatusTransitionError {
    if (this.status !== "pending") {
      return new InvalidOrderStatusTransitionError(
        this.id,
        this.status,
        "pending"
      );
    }
    this.date = now;
    this.updatedAt = now;
    this.transactionId = transactionId;
    if (price) this.price = price;
    this.status = "executed";
    return this;
  }

  public markCancelled({
    now,
  }: {
    now: Date;
  }): OrderEntity | InvalidOrderStatusTransitionError {
    if (this.status !== "pending") {
      return new InvalidOrderStatusTransitionError(
        this.id,
        this.status,
        "pending"
      );
    }
    this.status = "cancelled";
    this.updatedAt = now;

    return this;
  }

  public isBuy(): boolean {
    return this.type === "buy";
  }

  public isSell(): boolean {
    return this.type === "sell";
  }

  public static defaultFee(): Money {
    return Money.create({ amount: 1, currency: "EUR" }) as Money;
  }

  public toDTO(): OrderToDTO {
    return {
      id: this.id,
      IBAN: this.accountIban.value,
      ISIN: this.actionId,
      type: this.type,
      price: this.price,
      quantity: this.quantity,
      fee: this.fee,
      date: this.date ? this.date.toISOString() : undefined,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      status: this.status,
      transactionId: this.transactionId,
    };
  }
}

export type OrderToDTO = {
  IBAN: string;
  ISIN: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
} & Pick<
  OrderEntity,
  "id" | "type" | "quantity" | "price" | "fee" | "status" | "transactionId"
>;
