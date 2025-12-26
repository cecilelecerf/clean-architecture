import { PostRepository } from "@application/ports/repositories/PostRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { PostEntity } from "@domain/entities/PostEntity";

export interface SeedPostRequest {
  advisorId: string;
  title: string;
  content: string;
  tagsId: string[];
  clientId?: string;
  readBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

export class SeedPostUseCase {
  constructor(
    private postRepository: PostRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedPostRequest): Promise<PostEntity> {
    const now = this.clockService.now();

    const post = PostEntity.from({
      id: this.uuidService.generate(),
      advisorId: request.advisorId,
      title: request.title,
      content: request.content,
      tagsId: request.tagsId,
      clientId: request.clientId,
      readBy: request.readBy ?? [],
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
      publishedAt: request.publishedAt,
    });

    await this.postRepository.save(post);
    return post;
  }
}
