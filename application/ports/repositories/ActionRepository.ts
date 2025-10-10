import { ActionEntity } from "@domain/entities/ActionEntity";

export interface ActionRepository {
  findById(isin: ActionEntity["ISIN"]): Promise<ActionEntity>;
  findAll(): Promise<ActionEntity[]>;
  findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]>;
  setAvailability(action: ActionEntity): Promise<void>;
  save(action: ActionEntity): Promise<void>;
  update(action: ActionEntity): Promise<void>;
  delete(action: ActionEntity): Promise<void>;
}
