import { TagRepository } from "@application/ports/repositories/TagRepository";
import { TagEntity } from "@domain/entities/TagEntity";

export class GetAllTagsUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(): Promise<TagEntity[]> {
    return this.tagRepository.findAll();
  }
}
