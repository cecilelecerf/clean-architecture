import { Money } from "../values/Money";
import { ActionEntity } from "./ActionEntity";
import { UserEntity } from "./UserEntity";
import { MoneyCurrencyMismatchError } from "../errors/money/MoneyCurrencyMismatchError";
import { InvalidOrderStatusTransitionError } from "../errors/order/InvalidOrderStatusTransitionError";
import { MoneyCurrencyMissingError } from "../errors/money/MoneyCurrencyMissingError";
import { FactorNegativeError } from "../errors/money/MoneyFactorNegativeError";
import { MoneyAmountInvalidError } from "../errors/money/MoneyAmountInvalidError";
import { MoneyAmountNegativeError } from "../errors/money/MoneyAmountNegativeError";

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
    public status: "pending" | "executed" | "cancelled"
  ) {}

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
      status
    );
  }
  public getTotal():
    | Money
    | MoneyCurrencyMismatchError
    | MoneyAmountNegativeError
    | MoneyAmountInvalidError
    | FactorNegativeError
    | MoneyCurrencyMissingError {
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
}
