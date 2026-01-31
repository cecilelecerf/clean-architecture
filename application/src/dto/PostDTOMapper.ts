import {
  PostWithTags,
  PostWithTagsAndUser,
} from "@application/ports/repositories/PostRepository";
import { PostDTO } from "@domain/entities/PostEntity";
import { TagDTO } from "@domain/entities/TagEntity";
import { UserToDTO } from "@domain/entities/UserEntity";

export type PostWithTagsAndUsersDTO = PostDTO & {
  advisor: UserToDTO;
  tags: TagDTO[];
  client?: UserToDTO;
};

export type PostWithTagsDTO = PostDTO & {
  tags: TagDTO[];
};

export class PostDTOMapper {
  static tagsAndUserMap(post: PostWithTagsAndUser): PostWithTagsAndUsersDTO {
    return Object.assign(post.toDTO(), {
      advisor: post.advisor.toDTO(),
      tags: post.tags.map((t) => t.toDTO()),
      client: post.client ? post.client?.toDTO() : undefined,
    });
  }
  static tagsAndUserMaps(
    posts: PostWithTagsAndUser[],
  ): PostWithTagsAndUsersDTO[] {
    return posts.map((post) => this.tagsAndUserMap(post));
  }
  static tagsMap(post: PostWithTags): PostWithTagsDTO {
    return Object.assign(post.toDTO(), {
      tags: post.tags.map((t) => t.toDTO()),
    });
  }
  static tagsMaps(posts: PostWithTags[]): PostWithTagsDTO[] {
    return posts.map((post) => this.tagsMap(post));
  }
}
