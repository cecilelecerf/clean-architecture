import { Money } from "@domain/values/Money";
import { ActionEntity } from "./ActionEntity";
import {
  FactorNegativeError,
  MoneyAmountInvalidError,
  MoneyAmountNegativeError,
  MoneyCurrencyMissingError,
} from "@domain/errors/money";
import {
  InvalidOrderStatusTransitionError,
  InvalidOrderTypeError,
  InvalidQuantityError,
} from "@domain/errors/order";
import { TransactionEntity } from "./TransactionEntity";
import { AccountEntity } from "./AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import { InvalidOrderStatusError } from "@domain/errors/order/InvalidOrderStatusError";
import { ISIN } from "@domain/values/ISIN";

export class OrderEntity {
  private constructor(
    public id: string,
    public IBAN: AccountEntity["iban"],
    public ISIN: ActionEntity["ISIN"],
    public type: "buy" | "sell",
    public quantity: number,
    public price: Money,
    public status: "pending" | "executed" | "cancelled",
    public createdAt: Date,
    public updatedAt: Date,
    public date?: Date,
    public transactionId?: TransactionEntity["id"],
    public executionPrice?: Money
  ) {}

  private static validateType(
    type: string
  ): "buy" | "sell" | InvalidOrderTypeError {
    if (type !== "buy" && type !== "sell") {
      return new InvalidOrderTypeError(type);
    }
    return type;
  }
  public static validateStatus(
    status: string
  ): OrderEntity["status"] | InvalidOrderStatusError {
    if (
      status !== "pending" &&
      status !== "executed" &&
      status !== "cancelled"
    ) {
      return new InvalidOrderStatusError(status);
    }
    return status;
  }

  public static from({
    id,
    IBAN,
    ISIN,
    type,
    quantity,
    price,
    date,
    status,
    createdAt,
    updatedAt,
    transactionId,
    executionPrice,
  }: Pick<
    OrderEntity,
    | "id"
    | "IBAN"
    | "ISIN"
    | "type"
    | "quantity"
    | "price"
    | "date"
    | "status"
    | "createdAt"
    | "updatedAt"
    | "transactionId"
    | "executionPrice"
  >) {
    return new OrderEntity(
      id,
      IBAN,
      ISIN,
      type,
      quantity,
      price,
      status,
      createdAt,
      updatedAt,
      date,
      transactionId,
      executionPrice
    );
  }

  public getTotal():
    | Money
    | FactorNegativeError
    | MoneyCurrencyMissingError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError {
    const totalPrice = this.price.multiply(this.quantity);
    if (totalPrice instanceof Error) {
      return totalPrice;
    }
    return totalPrice;
  }

  static create({
    id,
    IBAN,
    ISIN,
    type,
    quantity,
    price,
    createdAt,
  }: {
    id: string;
    IBAN: IBAN;
    ISIN: ISIN;
    type: "buy" | "sell";
    quantity: number;
    price: Money;
    createdAt: Date;
  }): OrderEntity | InvalidOrderTypeError | InvalidQuantityError {
    const validateType = OrderEntity.validateType(type);
    if (validateType instanceof Error) return validateType;
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return new InvalidQuantityError(quantity);
    }

    return new OrderEntity(
      id,
      IBAN,
      ISIN,
      type,
      quantity,
      price,
      "pending",
      createdAt,
      createdAt,
      undefined,
      undefined,
      undefined
    );
  }

  /**
   * Calcule le prix d'exécution entre deux ordres
   * Règle : Le prix de l'ordre qui était déjà dans le carnet (maker)
   */
  static calculateExecutionPrice(
    _newOrder: OrderEntity,
    existingOrder: OrderEntity
  ): Money {
    return existingOrder.price;
  }
  isCompatibleWith(otherOrder: OrderEntity): boolean {
    if (this.type === otherOrder.type) return false;
    if (!this.ISIN.equals(otherOrder.ISIN)) return false;
    const buyOrder = this.type === "buy" ? this : otherOrder;
    const sellOrder = this.type === "sell" ? this : otherOrder;

    const buyPrice = buyOrder.price;
    const sellPrice = sellOrder.price;
    return buyPrice.amount >= sellPrice.amount;
  }
  public markExecuted({
    transactionId,
    now,
    executionPrice,
  }: {
    transactionId: TransactionEntity["id"];
    now: Date;
    executionPrice: Money;
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
    this.executionPrice = executionPrice;
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
      IBAN: this.IBAN.value,
      ISIN: this.ISIN.getValue(),
      type: this.type,
      price: this.price,
      quantity: this.quantity,
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
  "id" | "type" | "quantity" | "price" | "status" | "transactionId"
>;
