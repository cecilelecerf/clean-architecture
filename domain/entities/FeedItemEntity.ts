import { InvalidFeedTitleError } from "@domain/errors/feed/InvalidFeedTitleError";
import { TagEntity } from "./TagEntity";
import { UserEntity } from "./UserEntity";
import { InvalidFeedContentError } from "@domain/errors/feed/InvalidFeedContentError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { InvalidFeedItemAccessError } from "@application/errors/feed/InvalidFeedItemAccessError";

export class FeedItemEntity {
  private constructor(
    public id: string,
    public advisorId: UserEntity["id"],
    public title: string,
    public content: string,
    public tagsId: TagEntity["id"][],
    public createdAt: Date,
    public readBy: string[] = [],
    public modifiedAt?: Date,
    public publishedAt?: Date
  ) {}

  public static create({
    id,
    advisorId,
    title,
    content,
    tagsId,
    createdAt,
    modifiedAt,
    publishedAt,
  }: Pick<
    FeedItemEntity,
    | "id"
    | "advisorId"
    | "title"
    | "content"
    | "tagsId"
    | "createdAt"
    | "modifiedAt"
    | "publishedAt"
  >): FeedItemEntity | InvalidFeedContentError | InvalidFeedTitleError {
    const verifiedContent = this.verifyContent(content);
    if (verifiedContent instanceof Error) return verifiedContent;

    const verifiedTitle = this.verifyTitle(title);
    if (verifiedTitle instanceof Error) return verifiedTitle;
    return new FeedItemEntity(
      id,
      advisorId,
      verifiedTitle,
      verifiedContent,
      tagsId,
      createdAt,
      [],
      modifiedAt,
      publishedAt
    );
  }

  public static from({
    id,
    advisorId,
    title,
    content,
    tagsId,
    createdAt,
    modifiedAt,
    publishedAt,
    readBy,
  }: Pick<
    FeedItemEntity,
    | "id"
    | "advisorId"
    | "title"
    | "content"
    | "tagsId"
    | "createdAt"
    | "modifiedAt"
    | "publishedAt"
    | "readBy"
  >) {
    return new FeedItemEntity(
      id,
      advisorId,
      title,
      content,
      tagsId,
      createdAt,
      readBy,
      modifiedAt,
      publishedAt
    );
  }

  public editContent(
    newContent: FeedItemEntity["content"],
    now: Date
  ): FeedItemEntity | InvalidFeedContentError {
    const verifiedContent = FeedItemEntity.verifyContent(newContent);
    if (verifiedContent instanceof Error) return verifiedContent;
    this.content = verifiedContent;
    this.modifiedAt = now;
    return this;
  }

  public editTitle(
    newTitle: FeedItemEntity["title"],
    now: Date
  ): FeedItemEntity | InvalidFeedTitleError {
    const verifiedTitle = FeedItemEntity.verifyTitle(newTitle);
    if (verifiedTitle instanceof Error) return verifiedTitle;
    this.title = verifiedTitle;
    this.modifiedAt = now;
    return this;
  }

  public static verifyContent(
    content: FeedItemEntity["content"]
  ): InvalidFeedContentError | FeedItemEntity["content"] {
    const trimedContent = content.trim();
    if (trimedContent.length < 10 || trimedContent.length > 200)
      return new InvalidFeedContentError();
    return trimedContent;
  }
  public static verifyTitle(
    title: FeedItemEntity["title"]
  ): InvalidFeedTitleError | FeedItemEntity["title"] {
    const trimedTitle = title.trim();
    if (trimedTitle.length < 10 || trimedTitle.length > 100)
      return new InvalidFeedTitleError();
    return trimedTitle;
  }

  public published(now: Date) {
    this.publishedAt = now;
  }

  public permissionToModify(
    user: UserEntity
  ): UserRoleMismatchError | InvalidFeedItemAccessError | undefined {
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);
    if (user.hasRole({ role: "conseiller" }) && user.id === this.advisorId) {
      return new InvalidFeedItemAccessError(user.id, this.id);
    }
  }

  public markAsRead(userId: UserEntity["id"]): FeedItemEntity {
    if (!this.isReadBy(userId) && !!this.publishedAt) {
      this.readBy.push(userId);
    }
    return this;
  }

  public isReadBy(userId: UserEntity["id"]): boolean {
    return this.readBy.includes(userId);
  }
}
