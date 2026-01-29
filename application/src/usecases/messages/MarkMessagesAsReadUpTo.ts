import { ThreadNotFoundError } from "@application/errors/threads";
import { MessageRepository } from "@application/ports/repositories/MessageRepository";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UserEntity } from "@domain/entities/UserEntity";
import { MessageEntity } from "domain/entities/MessageEntity";
import { ThreadEntity } from "domain/entities/ThreadEntity";

type Props = { threadId: ThreadEntity["id"]; userId: UserEntity["id"] };

export class MarkMessagesAsReadUpTo {
  constructor(
    private messageRepository: MessageRepository,
    private clockService: ClockService,
    private threadRepository: ThreadRepository,
  ) {}

  async execute({
    threadId,
    userId,
  }: Props): Promise<
    { messageIds: MessageEntity["id"][], readAt : string } | ThreadNotFoundError
  > {
     const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();
    const now = this.clockService.now()
    const unreadMessages = await this.messageRepository.findUnreadUpTo(
      threadId,
      userId,
     now,
    );

    if (unreadMessages.length === 0) {
      return { messageIds: [], readAt: now.toISOString() };
    }

    unreadMessages.forEach((msg) => msg.userRead(userId));

    await this.messageRepository.updateMany(
      unreadMessages,
     now,
    );

    return { messageIds: unreadMessages.map(({ id }) => id), readAt : now.toISOString() };
  }
}
