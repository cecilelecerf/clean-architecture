import {
  InvalidPostTitleError,
  InvalidPostContentError,
} from "@domain/errors/posts";
import { TagEntity } from "./TagEntity";
import { UserEntity } from "./UserEntity";

export class PostEntity {
  private constructor(
    public id: string,
    public advisorId: UserEntity["id"],
    public title: string,
    public content: string,
    public tagsId: TagEntity["id"][],
    public createdAt: Date,
    public readBy: UserEntity["id"][] = [],
    public updatedAt: Date,
    public publishedAt?: Date,
    public clientId?: UserEntity["id"]
  ) {}

  public static create({
    id,
    advisorId,
    title,
    content,
    tagsId,
    createdAt,
    updatedAt,
    publishedAt,
    clientId,
  }: Pick<
    PostEntity,
    | "id"
    | "advisorId"
    | "title"
    | "content"
    | "tagsId"
    | "createdAt"
    | "updatedAt"
    | "publishedAt"
    | "clientId"
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
      updatedAt,
      publishedAt,
      clientId
    );
  }

  public static from({
    id,
    advisorId,
    title,
    content,
    tagsId,
    createdAt,
    updatedAt,
    publishedAt,
    readBy,
    clientId,
  }: Pick<
    PostEntity,
    | "id"
    | "advisorId"
    | "title"
    | "content"
    | "tagsId"
    | "createdAt"
    | "updatedAt"
    | "publishedAt"
    | "readBy"
    | "clientId"
  >) {
    return new PostEntity(
      id,
      advisorId,
      title,
      content,
      tagsId,
      createdAt,
      readBy,
      updatedAt,
      publishedAt,
      clientId
    );
  }

  public editContent(
    newContent: PostEntity["content"],
    now: Date
  ): PostEntity | InvalidPostContentError {
    const verifiedContent = PostEntity.verifyContent(newContent);
    if (verifiedContent instanceof Error) return verifiedContent;
    this.content = verifiedContent;
    this.updatedAt = now;
    return this;
  }

  public editTitle(
    newTitle: PostEntity["title"],
    now: Date
  ): PostEntity | InvalidPostTitleError {
    const verifiedTitle = PostEntity.verifyTitle(newTitle);
    if (verifiedTitle instanceof Error) return verifiedTitle;
    this.title = verifiedTitle;
    this.updatedAt = now;
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

  public updateStatus(status: boolean, now: Date) {
    if (status) {
      if (!this.publishedAt) {
        this.publishedAt = now;
      }
    } else {
      this.publishedAt = undefined;
    }

    this.updatedAt = now;
    return this;
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

  public toDTO(): PostDTO {
    return {
      id: this.id,
      advisorId: this.advisorId,
      title: this.title,
      content: this.content,
      tagsId: this.tagsId,
      readBy: this.readBy,
      clientId: this.clientId,
      updatedAt: this.updatedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      publishedAt: this.publishedAt?.toISOString(),
    };
  }
}

export type PostDTO = {
  updatedAt: string;
  createdAt: string;
  publishedAt?: string;
} & Pick<
  PostEntity,
  "id" | "advisorId" | "title" | "content" | "tagsId" | "readBy" | "clientId"
>;
