import { TagRepository } from "@application/ports/repositories/TagRepository";
import { TagDTO, TagEntity } from "@domain/entities/TagEntity";

export class GetAllTagsUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(): Promise<TagDTO[]> {
    const tags = await this.tagRepository.findAll();
    return tags.map((tag) => tag.toDTO());
  }
}
