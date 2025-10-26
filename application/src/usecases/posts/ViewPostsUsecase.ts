import { PostRepository } from "@application/ports/repositories/PostRepository";
import { PostEntity } from "@domain/entities/PostEntity";

export class ViewPostUsecase {
  constructor(private readonly PostRepository: PostRepository) {}
  public async execute(): Promise<PostEntity[]> {
    return await this.PostRepository.findAllRecent();
  }
}
