import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionEntity } from "@domain/entities/ActionEntity";
// TODO La ça manage pas c'est pluôto un FindAllActionAvailability (pour le nom) ?
export class ManageActionAvailabilityUsecase {
  public constructor(private readonly actionRepository: ActionRepository) {}

  public async execute(isAvailable : boolean): Promise<ActionEntity[]> {
    return await this.actionRepository.findAllAvailable(isAvailable);
  }
}