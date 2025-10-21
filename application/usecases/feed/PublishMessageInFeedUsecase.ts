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
  "id"
>;
export class PublishMessageInFeedUsecase {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    userId,
    id: feedItemId,
  }: Props): Promise<
    | FeedItemEntity
    | UserNotFoundError
    | UserNotActiveError
    | FeedItemNotFoundError
    | UserRoleMismatchError
    | InvalidFeedItemAccessError
  > {
    const feedItem = await this.feedRepository.findById(feedItemId);
    if (!feedItem) return new FeedItemNotFoundError();

    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const access = feedItem.permissionToModify(user);
    if (access instanceof Error) return access;

    feedItem.published(this.clockService.now());

    await this.feedRepository.update(feedItem);
    return feedItem;
  }
}
