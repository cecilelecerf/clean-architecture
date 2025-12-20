import { PostWithTagsAndUser } from "@application/ports/repositories/PostRepository";
import { PostEntity } from "@domain/entities/PostEntity";
import { TagDTO } from "@domain/entities/TagEntity";
import { UserToFront } from "@domain/entities/UserEntity";

export type PostWithTagsAndUsersDTO = PostEntity & {
  advisor: UserToFront;
  tags: TagDTO[];
};

export class PostDTOMapper {
  static map(post: PostWithTagsAndUser): PostWithTagsAndUsersDTO {
    return Object.assign(post, {
      advisor: post.advisor.toFront(),
      tags: post.tags.map((t) => t.toDTO()),
    });
  }
  static maps(posts: PostWithTagsAndUser[]): PostWithTagsAndUsersDTO[] {
    return posts.map((post) => this.map(post));
  }
}
