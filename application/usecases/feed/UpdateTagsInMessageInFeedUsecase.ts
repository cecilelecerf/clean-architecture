import { FeedItemNotFoundError } from "@application/errors/feed/FeedItemNotFoundError";
import { InvalidFeedItemAccessError } from "@application/errors/feed/InvalidFeedItemAccessError";
import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { FeedRepository } from "@application/ports/repositories/FeedRepository";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { FeedItemEntity } from "@domain/entities/FeedItemEntity";
type Props = {
  userId: FeedItemEntity["advisorId"];
} & Pick<FeedItemEntity, "id" | "tagsId">;
export class UpdateTagsInMessageInFeedUsecase {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly userRepository: UserRepository,
    private readonly tagRepository: TagRepository
  ) {}
  public async execute({
    userId,
    id: feedItemId,
    tagsId,
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

    feedItem.tagsId = [];
    for (const id of [...new Set(tagsId)]) {
      const tag = await this.tagRepository.findById(id);
      if (!tag) return new TagNotFoundError();
      feedItem.tagsId = [...feedItem.tagsId, tag.id];
    }
    await this.feedRepository.update(feedItem);
    return feedItem;
  }
}
