import { ActionEntity } from "./ActionEntity";
// import { UserEntity } from "./UserEntity";

export class OrderEntity {
  private constructor(
    public id: string,
    // public USERId: UserEntity["id"],
    public actionId: ActionEntity["ISIN"],
    public type: "buy" | "sell",
    public quantity: number,
    public price: number,
    public fee: number,
    public date: Date,
    public status: "pending" | "executed" | "cancelled"
  ) {}

  // TODO: Ajouter userId
  public static from({ id, actionId, type, quantity, price, fee, date, status}: OrderEntity) {
    return new OrderEntity(
      id,
      actionId,
      type,
      quantity,
      price,
      fee,
      date,
      status
    );
  }
}