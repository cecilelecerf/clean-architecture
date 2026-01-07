import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { SendMessage } from "../messages/SendMessage";
import { MessageRepository } from "@application/ports/repositories/MessageRepository";
import {
  ThreadNotFoundError,
  NoAdvisorFoundError,
  InvalidThreadParticipantsError,
} from "@application/errors/threads";

import {
  InvalidThreadAccessError,
  InvalidTitleError,
  ThreadClosedError,
} from "@domain/errors/thread";
import { ContentEmptyError } from "@domain/errors/message";

type Props = {
  clientId: UserEntity["id"];
  messageContent: MessageEntity["content"];
  actorId: UserEntity["id"];
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
    messageContent,
    actorId,
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

    const actor = await findActiveUser(this.userRepository, actorId);
    if (actor instanceof Error) return actor;

    if (actor.hasRole({ role: "client" }) && actor.id !== client.id)
      return new UserRoleMismatchError(["conseiller", "directeur"], actor.role);

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();
    const thread = ThreadEntity.create({
      id,
      createdAt,
      type: "external",
      participantsId: [clientId],
      title,
      administratorId: actor.hasRole({ role: "client" }) ? null : actor.id,
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
      senderId: actor.id,
      threadId: thread.id,
    });
    if (message instanceof Error) return message;
    return thread;
  }
}
