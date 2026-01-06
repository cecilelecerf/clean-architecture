import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export class InvalidOrderAccessError extends Error {
  public readonly statusCode = 403;
  constructor(userId: UserEntity["id"], orderId: OrderEntity["id"]) {
    super(
      `L'utilisateur ${userId} n'est pas autorisé à modifier l'ordre : ${orderId}.`
    );
    this.name = "InvalidOrderAccessError";
  }
}
