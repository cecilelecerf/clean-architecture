import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export class SetSavingsRateUsecase {
  public constructor(private readonly configRepository: SavingRateRepository) {}

  // Enregistrement du taux d'interêt que pour les user ayant le rôle de directeur
  // TODO : aucune vérification de faite
  public async execute(saving: SavingsRateEntity) {
    await this.configRepository.save(saving);
  }
}
