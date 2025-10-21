import { FeedItemNotFoundError } from "@application/errors/feed/FeedItemNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { FeedRepository } from "@application/ports/repositories/FeedRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { FeedItemEntity } from "@domain/entities/FeedItemEntity";

type Props = { userId: string; feedItemId: string };

export class MarkFeedItemAsRead {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
    feedItemId,
  }: Props): Promise<
    | FeedItemEntity
    | FeedItemNotFoundError
    | UserNotFoundError
    | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const feedItem = await this.feedRepository.findById(feedItemId);
    if (!feedItem) return new FeedItemNotFoundError();

    feedItem.markAsRead(userId);
    await this.feedRepository.update(feedItem);

    return feedItem;
  }
}
