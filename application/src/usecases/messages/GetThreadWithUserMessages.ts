import {
  MessageDTOMapper,
  MessageEntityWithUsersDTO,
} from "@application/dto/MessageDTOMapper";
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
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadClosedError } from "@domain/errors/thread";

type Props = { userId: UserEntity["id"] } & Pick<ThreadEntity, "id">;

export class GetThreadMessages {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly messageRepository: MessageRepository
  ) {}
  public async execute({
    userId,
    id,
  }: Props): Promise<
    | MessageEntityWithUsersDTO[]
    | UserNotFoundError
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | ThreadClosedError
    | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const thread = await this.threadRepository.findById(id);
    if (!thread) return new ThreadNotFoundError();
    if (thread.administratorId && !thread.hasAccess(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);
    const messages = await this.messageRepository.findAllWithUserByThread(
      thread.id
    );
    return MessageDTOMapper.maps(messages);
  }
}
