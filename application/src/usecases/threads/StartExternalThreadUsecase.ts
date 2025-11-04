import { InvalidThreadParticipantsError } from "@application/errors/threads/InvalidThreadParticipantsError";
import { NoAdvisorFoundError } from "@application/errors/threads/NoAdvisorFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { InvalidTitleError } from "@domain/errors/thread/InvalidTitleError";
import { SendMessage } from "../messages/SendMessage";
import { MessageRepository } from "@application/ports/repositories/MessageRepository";
import { ThreadNotFoundError } from "@application/errors/threads/ThreadNotFoundError";
import { InvalidThreadAccessError } from "@domain/errors/thread/InvalidThreadAccessError";
import { ContentEmptyError } from "@domain/errors/message/ContentEmptyError";
import { ThreadClosedError } from "@domain/errors/thread/ThreadClosedError";

type Props = {
  administratorId?: UserEntity["id"];
  clientId: UserEntity["id"];
  messageContent: MessageEntity["content"];
} & Pick<ThreadEntity, "title">;

export class StartExternalThreadUsecase {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository,
    private readonly messageRepository: MessageRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    title,
    clientId,
    administratorId,
    messageContent,
  }: Props): Promise<
    | ThreadEntity
    | UserNotFoundError
    | UserRoleMismatchError
    | InvalidThreadParticipantsError
    | UserNotActiveError
    | InvalidTitleError
    | NoAdvisorFoundError
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | ContentEmptyError
    | ThreadClosedError
  > {
    const client = await findActiveUser(this.userRepository, clientId);
    if (client instanceof Error) return client;

    if (!client?.hasRole({ role: "client" })) return new UserNotFoundError();

    const advisorId: UserEntity["id"] | undefined =
      administratorId ?? client.advisorId;
    if (!advisorId) return new NoAdvisorFoundError();

    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    if (!advisor?.hasRole({ role: "conseiller" }))
      return new UserRoleMismatchError(["conseiller"], advisor.role);

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();

    const thread = ThreadEntity.create({
      id,
      createdAt,
      type: "external",
      participantsId: [clientId],
      administratorId: advisor.id,
      title,
      isClose: false,
    });
    if (thread instanceof Error) return thread;
    await this.threadRepository.save(thread);

    const message = await new SendMessage(
      this.userRepository,
      this.threadRepository,
      this.messageRepository,
      this.uuidService,
      this.clockService
    ).execute({
      content: messageContent,
      senderId: administratorId ?? client.id,
      threadId: thread.id,
    });
    if (message instanceof Error) return message;

    return thread;
  }
}
