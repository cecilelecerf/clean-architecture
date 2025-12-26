import { Money } from "@domain/values/Money";
import { ActionEntity } from "./ActionEntity";
import { UserEntity } from "./UserEntity";
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

export class OrderEntity {
  private constructor(
    public id: string,
    public userId: UserEntity["id"],
    public actionId: ActionEntity["ISIN"],
    public type: "buy" | "sell",
    public quantity: number,
    public price: Money,
    public fee: Money,
    public date: Date,
    public status: "pending" | "executed" | "cancelled",
    public createdAt: Date,
    public updatedAt: Date
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
    userId,
    actionId,
    type,
    quantity,
    price,
    date,
    createdAt,
  }: Pick<
    OrderEntity,
    | "id"
    | "userId"
    | "actionId"
    | "type"
    | "quantity"
    | "price"
    | "date"
    | "createdAt"
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
      userId,
      actionId,
      validatedType,
      validatedQuantity,
      price,
      fee,
      date,
      "pending",
      createdAt,
      createdAt
    );
  }

  public static from({
    id,
    userId,
    actionId,
    type,
    quantity,
    price,
    fee,
    date,
    status,
    createdAt,
    updatedAt,
  }: Pick<
    OrderEntity,
    | "id"
    | "userId"
    | "actionId"
    | "type"
    | "quantity"
    | "price"
    | "fee"
    | "date"
    | "status"
    | "createdAt"
    | "updatedAt"
  >) {
    return new OrderEntity(
      id,
      userId,
      actionId,
      type,
      quantity,
      price,
      fee,
      date,
      status,
      createdAt,
      updatedAt
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

  public markExecuted(): OrderEntity | InvalidOrderStatusTransitionError {
    if (this.status !== "pending") {
      return new InvalidOrderStatusTransitionError(
        this.id,
        this.status,
        "pending"
      );
    }
    this.status = "executed";
    return this;
  }

  public markCancelled(): OrderEntity | InvalidOrderStatusTransitionError {
    if (this.status !== "pending") {
      return new InvalidOrderStatusTransitionError(
        this.id,
        this.status,
        "pending"
      );
    }
    this.status = "cancelled";
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
}
