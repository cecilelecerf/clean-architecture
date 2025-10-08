import { ActionEntity } from "@domain/entities/ActionEntity";

export interface ActionRepository {
  findById(isin: string): Promise<ActionEntity>;
  findAll(): Promise<ActionEntity[]>;
  findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]>;
  setAvailability(action: ActionEntity): Promise<void>;
  saveAction(action: ActionEntity): Promise<void>;
  updateAction(action: ActionEntity): Promise<void>;
  deleteAction(action: ActionEntity): Promise<void>;
}