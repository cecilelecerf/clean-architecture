import { InvalidPostTitleError as InvalidPostTitleError } from "@domain/errors/posts/InvalidPostTitleError";
import { TagEntity } from "./TagEntity";
import { UserEntity } from "./UserEntity";
import { InvalidPostContentError } from "@domain/errors/posts/InvalidPostContentError";

export class PostEntity {
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
    PostEntity,
    | "id"
    | "advisorId"
    | "title"
    | "content"
    | "tagsId"
    | "createdAt"
    | "modifiedAt"
    | "publishedAt"
  >): PostEntity | InvalidPostContentError | InvalidPostTitleError {
    const verifiedContent = this.verifyContent(content);
    if (verifiedContent instanceof Error) return verifiedContent;

    const verifiedTitle = this.verifyTitle(title);
    if (verifiedTitle instanceof Error) return verifiedTitle;
    return new PostEntity(
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
    PostEntity,
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
    return new PostEntity(
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
    newContent: PostEntity["content"],
    now: Date
  ): PostEntity | InvalidPostContentError {
    const verifiedContent = PostEntity.verifyContent(newContent);
    if (verifiedContent instanceof Error) return verifiedContent;
    this.content = verifiedContent;
    this.modifiedAt = now;
    return this;
  }

  public editTitle(
    newTitle: PostEntity["title"],
    now: Date
  ): PostEntity | InvalidPostTitleError {
    const verifiedTitle = PostEntity.verifyTitle(newTitle);
    if (verifiedTitle instanceof Error) return verifiedTitle;
    this.title = verifiedTitle;
    this.modifiedAt = now;
    return this;
  }

  public static verifyContent(
    content: PostEntity["content"]
  ): InvalidPostContentError | PostEntity["content"] {
    const trimedContent = content.trim();
    if (trimedContent.length < 10 || trimedContent.length > 200)
      return new InvalidPostContentError();
    return trimedContent;
  }
  public static verifyTitle(
    title: PostEntity["title"]
  ): InvalidPostTitleError | PostEntity["title"] {
    const trimedTitle = title.trim();
    if (trimedTitle.length < 10 || trimedTitle.length > 100)
      return new InvalidPostTitleError();
    return trimedTitle;
  }

  public published(now: Date) {
    this.publishedAt = now;
  }

  public permissionToModify(user: UserEntity): boolean {
    return (
      user.hasRole({ role: "directeur" }) ||
      (user.hasRole({ role: "conseiller" }) && user.id === this.advisorId)
    );
  }

  public markAsRead(userId: UserEntity["id"]): PostEntity {
    if (!this.isReadBy(userId) && !!this.publishedAt) {
      this.readBy.push(userId);
    }
    return this;
  }

  public isReadBy(userId: UserEntity["id"]): boolean {
    return this.readBy.includes(userId);
  }
}
