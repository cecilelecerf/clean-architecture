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
  public static from({ id, action, type, quantity, price, fee, date, status}: { id: string, action: ActionEntity["ISIN"], type: "buy" | "sell" , quantity: number, price: number, fee: number, date: Date, status: "pending" | "executed" | "cancelled"}) {
    return new OrderEntity(
      id,
      action,
      type,
      quantity,
      price,
      fee,
      date,
      status
    );
  }
}