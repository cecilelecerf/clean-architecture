import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionEntity } from "@domain/entities/ActionEntity";

export class CreateActionUsecase {
  public constructor(private readonly actionRepository: ActionRepository) {}

  // Création des actions que pour les user ayant le rôle de directeur
  public async execute(action: ActionEntity) {
    // Plein de vérification à faire -> tu dois récupérer l'id du user
    // faire les vérifications de rôle
    // TU ne récupère pas une ActionEntity
    await this.actionRepository.saveAction(action);
  }
}
