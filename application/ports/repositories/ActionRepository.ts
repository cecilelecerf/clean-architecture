import { ActionEntity } from "@domain/entities/ActionEntity";

export interface ActionRepository {
  findByISIN(isin: ActionEntity["ISIN"]): Promise<ActionEntity|null>;
  findAll(): Promise<ActionEntity[]|null>;
  findAllAvailable(): Promise<ActionEntity[]|null>;
  setAvailability(action: ActionEntity): Promise<void>;
  save(action: ActionEntity): Promise<void>;
  update(action: ActionEntity): Promise<void>;
  delete(action: ActionEntity): Promise<void>;
}
