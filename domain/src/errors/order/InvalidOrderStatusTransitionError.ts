import { OrderEntity } from "@domain/entities/OrderEntity";

export class InvalidOrderStatusTransitionError extends Error {
  public readonly statusCode = 409;
  constructor(
    public readonly orderId: OrderEntity["id"],
    public readonly currentStatus: OrderEntity["status"],
    public readonly expectedStatus: OrderEntity["status"]
  ) {
    super(
      `Cannot change order status from "${currentStatus}" (expected "${expectedStatus}").`
    );
    this.name = "InvalidOrderStatusTransitionError";
  }
}
