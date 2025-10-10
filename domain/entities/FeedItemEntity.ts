import { TagEntity } from "./TagEntity";
import { UserEntity } from "./UserEntity";

export class FeedItemEntity {
  private constructor(
    public id: string,
    public advisorId: UserEntity["id"],
    public title: string,
    public content: string,
    public tagsId: TagEntity[],
    public createdAt: Date,
    public modifiedAt?: Date,
    public isPublished?: boolean
  ) {}

  public static from({
    id,
    advisorId,
    title,
    content,
    tagsId,
    createdAt,
    modifiedAt,
  }: Pick<
    FeedItemEntity,
    | "id"
    | "advisorId"
    | "title"
    | "content"
    | "tagsId"
    | "createdAt"
    | "modifiedAt"
  >) {
    return new FeedItemEntity(
      id,
      advisorId,
      title,
      content,
      tagsId,
      createdAt,
      modifiedAt
    );
  }
}
