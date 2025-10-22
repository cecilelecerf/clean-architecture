import { ConfigRepository } from "@application/ports/repositories/ConfigRepository";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export class SetSavingsRateUsecase{
    public constructor(
        private readonly configRepository: ConfigRepository,
    ){}
    
    // Enregistrement du taux d'interêt que pour les user ayant le rôle de directeur
    public async execute(saving: SavingsRateEntity){
        await this.configRepository.saveSavingsRate(saving);
    }
}