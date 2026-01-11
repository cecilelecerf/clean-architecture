import { PostEntity } from "@domain/entities/PostEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export type PostWithTagsAndUser = PostEntity & {
  tags: TagEntity[];
  advisor: UserEntity;
};

export type PostWithTags = PostEntity & { tags: TagEntity[] };

export interface PostRepository {
  save(feed: PostEntity): Promise<void>;
  findById(id: PostEntity["id"]): Promise<PostEntity | null>;
  update(feed: PostEntity): Promise<void>;
  delete(id: PostEntity["id"]): Promise<void>;
  findAllPaginatedWithTagsAndUserByFilters(
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
      tagsId?: TagEntity["id"][];
      title?: PostEntity["title"];
      status?: boolean;
    },
    pagination: {
      page: number;
      limit: number;
    }
  ): Promise<{ posts: PostWithTagsAndUser[]; total: number }>;
  findWithTagsAndUserById(
    id: PostEntity["id"]
  ): Promise<PostWithTagsAndUser | null>;
  findAllUnreadWithTags(
    userId: UserEntity["id"]
  ): Promise<PostWithTagsAndUser[]>;
}
