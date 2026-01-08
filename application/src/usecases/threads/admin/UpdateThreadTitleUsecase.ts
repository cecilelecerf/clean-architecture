import {
  InvalidThreadAccessError,
  ThreadNotFoundError,
} from "@application/errors/threads";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { InvalidTitleError, ThreadClosedError } from "@domain/errors/thread";

type Props = {
  userId: UserEntity["id"];
  threadId: ThreadEntity["id"];
  title: string;
};

export class UpdateThreadTitleUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    threadId,
    userId,
    title,
  }: Props): Promise<
    | ThreadEntity
    | ThreadNotFoundError
    | InvalidThreadAccessError
    | UserNotFoundError
    | InvalidTitleError
    | ThreadClosedError
    | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const thread = await this.threadRepository.findById(threadId);
    if (!thread) return new ThreadNotFoundError();

    if (!thread.isAdministrator(user.id))
      return new InvalidThreadAccessError(user.id, thread.id);

    const updatedThread = thread.updateTitle(title, this.clockService.now());
    if (updatedThread instanceof Error) return updatedThread;

    await this.threadRepository.update(updatedThread);
    return updatedThread;
  }
}
/* 
Règle métier 
  - Nombre de caractère max
  - Nombre de caractère min
  - Trim
  - Vérfier si close
  - Update la date de modification

Règle applicative 
  - Que l'admin peut le faire
  - Le user existe
  - Le thread existe
*/
