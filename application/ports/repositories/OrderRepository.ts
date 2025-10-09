import { AccountEntity } from "@domain/entities/AccountEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface OrderRepository {
  findById(id: OrderEntity["id"]): Promise<OrderEntity>;
  findByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]>;
  findByActionId(actionISIN: ActionEntity["ISIN"]): Promise<OrderEntity[]>;
  findOpenOrders(): Promise<OrderEntity[]>;
  saveOrder(order: OrderEntity): Promise<void>;
  updateOrder(order: OrderEntity): Promise<void>;
  deleteOrder(order: OrderEntity): Promise<void>;
}
