import { FeedItemNotFoundError } from "@application/errors/feed/FeedItemNotFoundError";
import { InvalidFeedItemAccessError } from "@application/errors/feed/InvalidFeedItemAccessError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { FeedRepository } from "@application/ports/repositories/FeedRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { FeedItemEntity } from "@domain/entities/FeedItemEntity";
type Props = { userId: FeedItemEntity["advisorId"] } & Pick<
  FeedItemEntity,
  "content" | "title" | "id"
>;
export class EditMessageInFeedUsecase {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    userId,
    title,
    content,
    id: feedItemId,
  }: Props): Promise<
    | FeedItemEntity
    | UserNotFoundError
    | UserNotActiveError
    | FeedItemNotFoundError
    | UserRoleMismatchError
    | InvalidFeedItemAccessError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const feedItem = await this.feedRepository.findById(feedItemId);
    if (!feedItem) return new FeedItemNotFoundError();

    const access = feedItem.permissionToModify(user);
    if (access instanceof Error) return access;

    const updatedAt = this.clockService.now();

    feedItem.editContent(content, updatedAt);
    feedItem.editTitle(title, updatedAt);

    await this.feedRepository.update(feedItem);
    return feedItem;
  }
}
