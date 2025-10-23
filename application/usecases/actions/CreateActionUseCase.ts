import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionEntity } from "@domain/entities/ActionEntity";

export class CreateActionUsecase{
    public constructor(
        private readonly actionRepository: ActionRepository,
    ){}

    // Création des actions que pour les user ayant le rôle de directeur
    public async execute(action: ActionEntity){
        await this.actionRepository.saveAction(action);
    }
}