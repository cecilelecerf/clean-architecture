import { MessageRepository } from "@application/ports/repositories/MessageRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { MessageEntity } from "@domain/entities/MessageEntity";

export interface SeedMessageRequest {
  threadId: string;
  senderId: string;
  content: string;
  readBy?: string[];
  sentAt?: Date;
}

export class SeedMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedMessageRequest): Promise<MessageEntity> {
    const message = MessageEntity.from({
      id: this.uuidService.generate(),
      threadId: request.threadId,
      senderId: request.senderId,
      content: request.content,
      sentAt: request.sentAt ?? this.clockService.now(),
      readBy: request.readBy ?? [],
    });

    await this.messageRepository.save(message);
    return message;
  }
}
