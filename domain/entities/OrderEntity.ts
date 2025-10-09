import { Money } from "@domain/values/Money";
import { ActionEntity } from "./ActionEntity";
import { UserEntity } from "./UserEntity";
import { MoneyCurrencyMismatchError } from "@domain/errors/money/MoneyCurrencyMismatchError";

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
  }: OrderEntity) {
    return new OrderEntity(
      crypto.randomUUID(),
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
  public getTotal(): Money | MoneyCurrencyMismatchError {
    const totalPrice = this.price.multiply(this.quantity);
    if (totalPrice instanceof Error) {
      return totalPrice;
    }
    return totalPrice.add(this.fee);
  }
  public markExecuted(): void {
    if (this.status !== "pending") {
      throw new Error("Only pending orders can be executed");
    }
    this.status = "executed";
  }

  public markCancelled(): void {
    if (this.status !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }
    this.status = "cancelled";
  }
  public isBuy(): boolean {
    return this.type === "buy";
  }

  public isSell(): boolean {
    return this.type === "sell";
  }
}
