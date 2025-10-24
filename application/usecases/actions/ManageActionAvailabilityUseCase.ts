import { ActionRepository } from "@application/ports/repositories/ActionRepository";
// Tu as rien d'autre à faire que un get pour une manage
export class ManageActionAvailabilityUsecase {
  public constructor(private readonly actionRepository: ActionRepository) {}

  public async execute() {
    await this.actionRepository.findAllAvailable();
  }
}
