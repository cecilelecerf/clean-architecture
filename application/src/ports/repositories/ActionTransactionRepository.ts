import {
  ActionTransactionEntity,
  ActionTransactionType,
} from "@domain/entities/ActionTransactionEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface ActionTransactionRepository {
  save(transaction: ActionTransactionEntity): Promise<void>;
  findById(id: string): Promise<ActionTransactionEntity | null>;
  findByUserId(userId: UserEntity["id"]): Promise<ActionTransactionEntity[]>;
  findByISIN(isin: string): Promise<ActionTransactionEntity[]>;
  findByUserIdAndISIN(
    userId: UserEntity["id"],
    isin: string
  ): Promise<ActionTransactionEntity[]>;
  findByType(
    userId: UserEntity["id"],
    type: ActionTransactionType
  ): Promise<ActionTransactionEntity[]>;
}
