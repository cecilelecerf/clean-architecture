import { MessageEntityWithUsersDTO } from "@application/dto/MessageDTOMapper";
import {
  InvalidThreadAccessError,
  ThreadNotFoundError,
} from "@application/errors/threads";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ContentEmptyError, ContentTooLongError } from "@domain/errors/message";
import { ThreadClosedError } from "@domain/errors/thread";

type Props = {} & Pick<MessageEntity, "content" | "senderId" | "threadId">;

export class SendMessage {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly messageRepository: MessageRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    content,
    senderId,
    threadId,
  }: Props): Promise<
    | MessageEntityWithUsersDTO
    | UserNotFoundError
    | UserNotActiveError
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | ThreadClosedError
    | ContentEmptyError
    | ContentTooLongError
  > {
    const user = await findActiveUser(this.userRepository, senderId);
    if (user instanceof Error) return user;
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();
    if (thread.isClose) return new ThreadClosedError(thread.id);
    if (!thread.hasAccess(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);

    const id = this.uuidService.generate();
    const sentAt = this.clockService.now();

    const message = MessageEntity.create({
      id,
      threadId,
      senderId,
      sentAt,
      content,
    });

    if (message instanceof Error) return message;

    this.messageRepository.save(message);
    return Object.assign(message, { sender: user.toDTO() });
  }
}
