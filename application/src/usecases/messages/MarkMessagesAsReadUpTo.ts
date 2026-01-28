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
    { messageIds: MessageEntity["id"][] } | ThreadNotFoundError
  > {
    console.log("MARK MESSAGE");
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();
    const unreadMessages = await this.messageRepository.findUnreadUpTo(
      threadId,
      userId,
      this.clockService.now(),
    );

    if (unreadMessages.length === 0) {
      return { messageIds: [] };
    }

    unreadMessages.forEach((msg) => msg.userRead(userId));

    await this.messageRepository.updateMany(
      unreadMessages,
      this.clockService.now(),
    );

    return { messageIds: unreadMessages.map(({ id }) => id) };
  }
}
