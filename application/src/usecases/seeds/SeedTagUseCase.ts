import { TagRepository } from "@application/ports/repositories/TagRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { TagEntity } from "@domain/entities/TagEntity";
import { Color } from "@domain/values/Color";

export interface SeedTagRequest {
  label: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedTagUseCase {
  constructor(
    private tagRepository: TagRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedTagRequest): Promise<TagEntity> {
    const color = Color.from(request.color);
    if (color instanceof Error) {
      throw new Error(`Invalid color: ${request.color}`);
    }

    const now = this.clockService.now();

    const tag = TagEntity.from({
      id: this.uuidService.generate(),
      label: request.label,
      color,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.tagRepository.save(tag);
    return tag;
  }
}
