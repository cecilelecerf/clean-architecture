import { AccountEntity } from "@domain/entities/AccountEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ISIN } from "@domain/values/ISIN";
export type OrderEntityWithAccount = OrderEntity & { account: AccountEntity };

export interface OrderRepository {
  findById(id: OrderEntity["id"]): Promise<OrderEntity | null>;
  findByIdWithAccount(
    id: OrderEntity["id"]
  ): Promise<OrderEntityWithAccount | null>;
  findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]>;
  findAllByActionIdAndStatus(
    actionISIN: ActionEntity["ISIN"],
    status?: OrderEntity["status"]
  ): Promise<OrderEntity[]>;

  findAllExecutedByISINAndDateRange(
    isin: ISIN,
    startDate: Date,
    endDate: Date
  ): Promise<OrderEntity[]>;
  findAllByActionIdAndStatusAndUserId(
    actionISIN: ActionEntity["ISIN"],
    userId: UserEntity["id"],
    status?: OrderEntity["status"]
  ): Promise<OrderEntity[]>;
  findAllOpen(): Promise<OrderEntity[]>;
  save(order: OrderEntity): Promise<void>;
  update(order: OrderEntity): Promise<void>;
  delete(id: OrderEntity["id"]): Promise<void>;
  findAllByUserIdAndStatus(
    userId: UserEntity["id"],
    status: OrderEntity["status"]
  ): Promise<OrderEntity[]>;
}
