import { ActionRepository } from "@application/ports/repositories/ActionRepository";

export class ManageActionAvailabilityUsecase{
    public constructor(
        private readonly actionRepository: ActionRepository,
    ){}

    public async execute(){
        await this.actionRepository.findAllAvailable();
    }
}