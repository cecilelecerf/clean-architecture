import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { ThreadEntity } from "@domain/entities/ThreadEntity";

export interface SeedThreadRequest {
  administratorId: string | null;
  participantsId: string[];
  title: string;
  type: "external" | "internal";
  isClose?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedThreadUseCase {
  constructor(
    private threadRepository: ThreadRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedThreadRequest): Promise<ThreadEntity> {
    const now = this.clockService.now();

    const thread = ThreadEntity.from({
      id: this.uuidService.generate(),
      administratorId: request.administratorId,
      participantsId: request.participantsId,
      title: request.title,
      type: request.type,
      isClose: request.isClose ?? false,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.threadRepository.save(thread);
    return thread;
  }
}
