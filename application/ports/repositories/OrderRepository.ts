import { OrderEntity } from "@domain/entities/OrderEntity";

export interface OrderRepository {
  findById(id: string): Promise<OrderEntity>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  findByActionId(actionId: string): Promise<OrderEntity[]>;
  findOpenOrders(): Promise<OrderEntity[]>;
  saveOrder(order: OrderEntity): Promise<void>;
  updateOrder(order: OrderEntity): Promise<void>;
  deleteOrder(order: OrderEntity): Promise<void>;
}