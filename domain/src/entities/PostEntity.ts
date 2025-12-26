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

  private static validateContent(
    content: string
  ): string | InvalidPostContentError {
    const trimmed = content.trim();
    if (trimmed.length < 10 || trimmed.length > 5000) {
      return new InvalidPostContentError(trimmed.length);
    }
    return trimmed;
  }

  private static validateTitle(title: string): string | InvalidPostTitleError {
    const trimmed = title.trim();
    if (trimmed.length < 5 || trimmed.length > 100) {
      return new InvalidPostTitleError(trimmed.length);
    }
    return trimmed;
  }

  public static create({
    id,
    advisorId,
    title,
    content,
    tagsId,
    createdAt,
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
    | "publishedAt"
    | "clientId"
  >): PostEntity | InvalidPostContentError | InvalidPostTitleError {
    const validatedTitle = this.validateTitle(title);
    if (validatedTitle instanceof Error) return validatedTitle;

    const validatedContent = this.validateContent(content);
    if (validatedContent instanceof Error) return validatedContent;

    return new PostEntity(
      id,
      advisorId,
      validatedTitle,
      validatedContent,
      tagsId,
      createdAt,
      [],
      createdAt,
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
    const verifiedContent = PostEntity.validateContent(newContent);
    if (verifiedContent instanceof Error) return verifiedContent;
    this.content = verifiedContent;
    this.updatedAt = now;
    return this;
  }

  public editTitle(
    newTitle: PostEntity["title"],
    now: Date
  ): PostEntity | InvalidPostTitleError {
    const verifiedTitle = PostEntity.validateTitle(newTitle);
    if (verifiedTitle instanceof Error) return verifiedTitle;
    this.title = verifiedTitle;
    this.updatedAt = now;
    return this;
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
