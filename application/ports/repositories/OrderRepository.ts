import { AccountEntity } from "@domain/entities/AccountEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface OrderRepository {
  findById(id: OrderEntity["id"]): Promise<OrderEntity | null>;
  findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]>;
  findAllByActionId(actionISIN: ActionEntity["ISIN"]): Promise<OrderEntity[]>;
  findAllOpen(): Promise<OrderEntity[]>;
  save(order: OrderEntity): Promise<void>;
  update(order: OrderEntity): Promise<void>;
  delete(order: OrderEntity): Promise<void>;
}
