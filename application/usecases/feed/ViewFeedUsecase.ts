import { FeedRepository } from "@application/ports/repositories/FeedRepository";
import { FeedItemEntity } from "@domain/entities/FeedItemEntity";

export class ViewFeedUsecase {
  constructor(private readonly FeedRepository: FeedRepository) {}
  public async execute(): Promise<FeedItemEntity[]> {
    return await this.FeedRepository.findAllRecent();
  }
}
