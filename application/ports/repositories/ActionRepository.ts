import { ActionEntity } from "@domain/entities/ActionEntity";

export interface ActionRepository {
  findByISIN(isin: ActionEntity["ISIN"]): Promise<ActionEntity|null>;
  findAll(): Promise<ActionEntity[]|null>;
  findAllAvailable(): Promise<ActionEntity[]|null>;
  setAvailability(action: ActionEntity): Promise<void>;
  saveAction(action: ActionEntity): Promise<void>;
  updateAction(action: ActionEntity): Promise<void>;
  deleteAction(action: ActionEntity): Promise<void>;
}
